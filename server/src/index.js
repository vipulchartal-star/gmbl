import cors from 'cors';
import express from 'express';

import { issueToken, requireAuth } from './auth.js';
import { config } from './config.js';
import { pool, withTransaction } from './db.js';
import { ensureDefaultMarket, sanitizeMarket } from './market.js';
import { hashPassword, verifyPassword } from './password.js';

const app = express();
const marketSubscribers = new Set();

app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin }));
app.use(express.json());

const logAuth = (event, details = {}) => {
  console.log(`[auth] ${event}`, details);
};

const publishMarket = (market) => {
  const payload = `event: market\ndata: ${JSON.stringify(market)}\n\n`;
  for (const subscriber of marketSubscribers) {
    subscriber.write(payload);
  }
};

app.get('/health', async (_req, res) => {
  const db = await pool.query('select now() as now');
  res.json({ ok: true, dbTime: db.rows[0].now });
});

app.get('/market', async (_req, res) => {
  const market = await withTransaction((client) => ensureDefaultMarket(client));
  res.json({ market: sanitizeMarket(market) });
});

app.get('/market/stream', async (_req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  marketSubscribers.add(res);

  const market = await withTransaction((client) => ensureDefaultMarket(client));
  res.write(`event: market\ndata: ${JSON.stringify(sanitizeMarket(market))}\n\n`);

  const heartbeat = setInterval(() => {
    res.write('event: ping\ndata: {}\n\n');
  }, 15000);

  res.on('close', () => {
    clearInterval(heartbeat);
    marketSubscribers.delete(res);
  });
});

app.post('/auth/signup', async (req, res) => {
  const loginId = String(req.body.loginId ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '');
  const username = loginId;

  logAuth('signup_attempt', { loginId, passwordLength: password.length });

  if (loginId.length < 4 || password.length < 6) {
    logAuth('signup_invalid_payload', { loginId, passwordLength: password.length });
    res.status(400).json({ error: 'Invalid signup payload.' });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    const result = await withTransaction(async (client) => {
      await ensureDefaultMarket(client);

      const existing = await client.query('select id from app_users where login_id = $1', [loginId]);
      if (existing.rows[0]) {
        logAuth('signup_login_id_taken', { loginId });
        throw new Error('LOGIN_ID_TAKEN');
      }

      const insertedUser = await client.query(
        `insert into app_users (login_id, username, password_hash, balance)
         values ($1, $2, $3, $4)
         returning id, login_id, username, balance, created_at`,
        [loginId, username, passwordHash, config.signupStartingBalance],
      );

      const user = insertedUser.rows[0];

      await client.query(
        `insert into wallet_transactions (user_id, kind, amount_delta, balance_after, note)
         values ($1, 'signup_bonus', $2, $2, 'Initial anonymous balance')`,
        [user.id, config.signupStartingBalance],
      );

      return user;
    });

    logAuth('signup_success', { loginId, userId: result.id });

    res.status(201).json({
      token: issueToken(result),
      user: {
        id: result.id,
        loginId: result.login_id,
        username: result.username,
        balance: Number(result.balance),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'LOGIN_ID_TAKEN') {
      res.status(409).json({ error: 'Login id is already in use.' });
      return;
    }

    logAuth('signup_error', { loginId, error: error instanceof Error ? error.message : 'unknown' });
    res.status(500).json({ error: 'Signup failed.' });
  }
});

app.post('/auth/login', async (req, res) => {
  const loginId = String(req.body.loginId ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '');

  logAuth('login_attempt', { loginId, passwordLength: password.length });

  if (!loginId || !password) {
    logAuth('login_missing_credentials', { loginId, passwordLength: password.length });
    res.status(400).json({ error: 'Missing login credentials.' });
    return;
  }

  try {
    const result = await pool.query(
      'select id, login_id, username, password_hash, balance from app_users where login_id = $1',
      [loginId],
    );
    const user = result.rows[0];

    if (!user) {
      logAuth('login_user_not_found', { loginId });
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const matches = await verifyPassword(password, user.password_hash);
    if (!matches) {
      logAuth('login_password_mismatch', { loginId, userId: user.id });
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    logAuth('login_success', { loginId, userId: user.id });

    res.json({
      token: issueToken(user),
      user: {
        id: user.id,
        loginId: user.login_id,
        username: user.username,
        balance: Number(user.balance),
      },
    });
  } catch (error) {
    logAuth('login_error', { loginId, error: error instanceof Error ? error.message : 'unknown' });
    res.status(500).json({ error: 'Login failed.' });
  }
});

app.get('/me', requireAuth, async (req, res) => {
  const result = await pool.query(
    'select id, login_id, username, balance, created_at from app_users where id = $1',
    [req.auth.sub],
  );
  const user = result.rows[0];

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      loginId: user.login_id,
      username: user.username,
      balance: Number(user.balance),
      createdAt: user.created_at,
    },
  });
});

app.post('/bets', requireAuth, async (req, res) => {
  const side = req.body.side;
  const amount = Number(req.body.amount);

  if (!(side === 'yes' || side === 'no') || !Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ error: 'Invalid bet payload.' });
    return;
  }

  try {
    const result = await withTransaction(async (client) => {
      const market = await ensureDefaultMarket(client);
      const userResult = await client.query(
        'select id, login_id, username, balance from app_users where id = $1 for update',
        [req.auth.sub],
      );
      const user = userResult.rows[0];

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      const balance = Number(user.balance);
      if (balance < amount) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      const nextBalance = balance - amount;
      const betResult = await client.query(
        `insert into bets (market_slug, user_id, side, amount)
         values ($1, $2, $3, $4)
         returning id, market_slug, side, amount, created_at`,
        [market.slug, user.id, side, amount],
      );

      await client.query(
        `update app_users
         set balance = $2, updated_at = now()
         where id = $1`,
        [user.id, nextBalance],
      );

      await client.query(
        `insert into wallet_transactions (user_id, kind, amount_delta, balance_after, reference_id, note)
         values ($1, 'bet', $2, $3, $4, $5)`,
        [user.id, -amount, nextBalance, betResult.rows[0].id, `${side.toUpperCase()} bet`],
      );

      const marketUpdate = await client.query(
        `update markets
         set yes_pool = yes_pool + $2,
             no_pool = no_pool + $3,
             total_bets = total_bets + 1,
             updated_at = now()
         where slug = $1
         returning *`,
        [market.slug, side === 'yes' ? amount : 0, side === 'no' ? amount : 0],
      );

      return {
        bet: betResult.rows[0],
        balance: nextBalance,
        market: sanitizeMarket(marketUpdate.rows[0]),
      };
    });

    publishMarket(result.market);

    logAuth('signup_success', { loginId, userId: result.id });

    res.status(201).json({
      bet: {
        id: result.bet.id,
        marketSlug: result.bet.market_slug,
        side: result.bet.side,
        amount: Number(result.bet.amount),
        createdAt: result.bet.created_at,
      },
      balance: result.balance,
      market: result.market,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (error instanceof Error && error.message === 'INSUFFICIENT_BALANCE') {
      res.status(409).json({ error: 'Insufficient balance.' });
      return;
    }

    res.status(500).json({ error: 'Bet placement failed.' });
  }
});

app.get('/bets/me', requireAuth, async (req, res) => {
  const result = await pool.query(
    `select id, market_slug, side, amount, created_at
     from bets
     where user_id = $1
     order by created_at desc
     limit 50`,
    [req.auth.sub],
  );

  res.json({
    bets: result.rows.map((row) => ({
      id: row.id,
      marketSlug: row.market_slug,
      side: row.side,
      amount: Number(row.amount),
      createdAt: row.created_at,
    })),
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error.' });
});

const start = async () => {
  await withTransaction((client) => ensureDefaultMarket(client));

  app.listen(config.port, () => {
    console.log(`GMBL server listening on ${config.port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});

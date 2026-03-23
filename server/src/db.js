import pg from 'pg';

import { config } from './config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl:
    config.databaseUrl.includes('localhost') || config.databaseUrl.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
});

export const withTransaction = async (handler) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await handler(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const ensureSchema = async () => {
  await pool.query("alter table markets add column if not exists settled_side text check (settled_side in ('yes', 'no'))");
  await pool.query('alter table markets add column if not exists settled_at timestamptz');
  await pool.query('alter table bets add column if not exists odds numeric(12, 4)');
  await pool.query("update bets set odds = 2.0 where odds is null");
  await pool.query("create unique index if not exists wallet_transactions_settlement_payout_ref_idx on wallet_transactions(reference_id, kind) where kind = 'settlement_payout'");
};

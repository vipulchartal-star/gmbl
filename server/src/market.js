import { config } from './config.js';

export const sanitizeMarket = (row) => ({
  slug: row.slug,
  question: row.question,
  status: row.status,
  yesPool: Number(row.yes_pool),
  noPool: Number(row.no_pool),
  totalPool: Number(row.yes_pool) + Number(row.no_pool),
  totalBets: row.total_bets,
  updatedAt: row.updated_at,
});

export const ensureDefaultMarket = async (client) => {
  const inserted = await client.query(
    `insert into markets (slug, question)
     values ($1, $2)
     on conflict (slug) do nothing
     returning *`,
    [config.defaultMarketSlug, config.defaultMarketQuestion],
  );

  if (inserted.rows[0]) {
    return inserted.rows[0];
  }

  const existing = await client.query('select * from markets where slug = $1', [config.defaultMarketSlug]);
  return existing.rows[0];
};

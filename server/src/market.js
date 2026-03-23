export const configuredMarkets = [
  {
    slug: 'mi-vs-kkr-toss',
    question: 'MI vs KKR Toss',
    yesOdds: 1.9,
    noOdds: 1.92,
  },
  {
    slug: 'mi-vs-kkr-bookmaker',
    question: 'MI vs KKR Bookmaker',
    yesOdds: 2.18,
    noOdds: 1.78,
  },
  {
    slug: 'mi-vs-kkr-match-odds',
    question: 'MI vs KKR Match Odds',
    yesOdds: 2.06,
    noOdds: 1.84,
  },
];

const marketInsertSql = 'insert into markets (slug, question) values ($' + '1, $' + '2) on conflict (slug) do nothing';
const marketListSql = 'select * from markets where slug = any($' + '1::text[]) order by array_position($' + '1::text[], slug)';
const marketBySlugSql = 'select * from markets where slug = $' + '1';

export const sanitizeMarket = (row) => ({
  slug: row.slug,
  question: row.question,
  status: row.status,
  yesPool: Number(row.yes_pool),
  noPool: Number(row.no_pool),
  totalPool: Number(row.yes_pool) + Number(row.no_pool),
  totalBets: row.total_bets,
  settledSide: row.settled_side,
  settledAt: row.settled_at,
  updatedAt: row.updated_at,
});

export const findMarketDefinition = (slug) => configuredMarkets.find((market) => market.slug === slug) ?? null;

export const oddsForSide = (marketDefinition, side) => (side === 'yes' ? marketDefinition.yesOdds : marketDefinition.noOdds);

export const ensureConfiguredMarkets = async (client) => {
  for (const market of configuredMarkets) {
    await client.query(marketInsertSql, [market.slug, market.question]);
  }

  const result = await client.query(marketListSql, [configuredMarkets.map((market) => market.slug)]);
  return result.rows;
};

export const ensureMarketBySlug = async (client, slug) => {
  await ensureConfiguredMarkets(client);
  const result = await client.query(marketBySlugSql, [slug]);
  return result.rows[0] ?? null;
};

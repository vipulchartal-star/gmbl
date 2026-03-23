const seedLiquidity = 125;
const houseMargin = 0.04;
const minOdds = 1.05;
const maxOdds = 12;

export const configuredMarkets = [
  {
    slug: 'mi-vs-kkr-toss',
    question: 'MI vs KKR Toss',
    match: 'MI vs KKR',
    marketLabel: 'Toss',
    outcomeLabel: 'MI wins the toss',
    backLabel: 'Back MI to win the toss',
    layLabel: 'Lay MI to win the toss',
  },
  {
    slug: 'mi-vs-kkr-bookmaker',
    question: 'MI vs KKR Bookmaker',
    match: 'MI vs KKR',
    marketLabel: 'Bookmaker',
    outcomeLabel: 'MI wins the match',
    backLabel: 'Back MI to win',
    layLabel: 'Lay MI to win',
  },
  {
    slug: 'mi-vs-kkr-match-odds',
    question: 'MI vs KKR Match Odds',
    match: 'MI vs KKR',
    marketLabel: 'Match Odds',
    outcomeLabel: 'MI wins the match',
    backLabel: 'Back MI to win',
    layLabel: 'Lay MI to win',
  },
];

const marketInsertSql = 'insert into markets (slug, question) values ($' + '1, $' + '2) on conflict (slug) do nothing';
const marketListSql = 'select * from markets where slug = any($' + '1::text[]) order by array_position($' + '1::text[], slug)';
const marketBySlugSql = 'select * from markets where slug = $' + '1';

const roundOdds = (value) => Number(Math.min(maxOdds, Math.max(minOdds, value)).toFixed(2));

export const calculateMarketOdds = (row) => {
  const yesPool = Number(row.yes_pool ?? row.yesPool ?? 0);
  const noPool = Number(row.no_pool ?? row.noPool ?? 0);
  const adjustedYesPool = yesPool + seedLiquidity;
  const adjustedNoPool = noPool + seedLiquidity;
  const totalPool = adjustedYesPool + adjustedNoPool;
  const yesProbability = adjustedYesPool / totalPool;
  const noProbability = adjustedNoPool / totalPool;

  return {
    yesOdds: roundOdds((1 / yesProbability) * (1 - houseMargin)),
    noOdds: roundOdds((1 / noProbability) * (1 - houseMargin)),
  };
};

export const sanitizeMarket = (row) => {
  const definition = findMarketDefinition(row.slug);
  const odds = calculateMarketOdds(row);

  return {
    slug: row.slug,
    question: row.question,
    match: definition?.match ?? row.question,
    marketLabel: definition?.marketLabel ?? row.question,
    outcomeLabel: definition?.outcomeLabel ?? row.question,
    backLabel: definition?.backLabel ?? ('Back ' + row.question),
    layLabel: definition?.layLabel ?? ('Lay ' + row.question),
    status: row.status,
    yesPool: Number(row.yes_pool),
    noPool: Number(row.no_pool),
    totalPool: Number(row.yes_pool) + Number(row.no_pool),
    totalBets: row.total_bets,
    yesOdds: odds.yesOdds,
    noOdds: odds.noOdds,
    settledSide: row.settled_side,
    settledAt: row.settled_at,
    updatedAt: row.updated_at,
  };
};

export const findMarketDefinition = (slug) => configuredMarkets.find((market) => market.slug === slug) ?? null;

export const oddsForSide = (marketRow, side) => {
  const odds = calculateMarketOdds(marketRow);
  return side === 'yes' ? odds.yesOdds : odds.noOdds;
};

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

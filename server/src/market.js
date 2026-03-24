const seedLiquidity = 125;
const houseMargin = 0.04;
const minOdds = 1.05;
const maxOdds = 12;

const ballOutcomeDefinitions = [
  { key: 'dot', label: '0 runs', description: 'dot ball', sortOrder: 1 },
  { key: 'single', label: '1 run', description: '1 run', sortOrder: 2 },
  { key: 'double', label: '2 runs', description: '2 runs', sortOrder: 3 },
  { key: 'triple', label: '3 runs', description: '3 runs', sortOrder: 4 },
  { key: 'four', label: '4 runs', description: '4 runs', sortOrder: 5 },
  { key: 'five', label: '5 runs', description: '5 runs', sortOrder: 6 },
  { key: 'six', label: '6 runs', description: '6 runs', sortOrder: 7 },
  { key: 'wicket', label: 'Wicket', description: 'a wicket', sortOrder: 8 },
  { key: 'wide', label: 'Wide', description: 'a wide is called', sortOrder: 9 },
  { key: 'no-ball', label: 'No Ball', description: 'a no ball is called', sortOrder: 10 },
  { key: 'bye', label: 'Bye', description: 'bye runs are scored', sortOrder: 11 },
  { key: 'leg-bye', label: 'Leg Bye', description: 'leg bye runs are scored', sortOrder: 12 },
];

const baseMarkets = [
  {
    slug: 'mi-vs-kkr-toss',
    question: 'MI vs KKR Toss',
    match: 'MI vs KKR',
    marketLabel: 'Toss',
    outcomeLabel: 'MI wins the toss',
    backLabel: 'Back MI to win the toss',
    layLabel: 'Lay MI to win the toss',
    marketType: 'standard',
  },
  {
    slug: 'mi-vs-kkr-bookmaker',
    question: 'MI vs KKR Bookmaker',
    match: 'MI vs KKR',
    marketLabel: 'Bookmaker',
    outcomeLabel: 'MI wins the match',
    backLabel: 'Back MI to win',
    layLabel: 'Lay MI to win',
    marketType: 'standard',
  },
  {
    slug: 'mi-vs-kkr-match-odds',
    question: 'MI vs KKR Match Odds',
    match: 'MI vs KKR',
    marketLabel: 'Match Odds',
    outcomeLabel: 'MI wins the match',
    backLabel: 'Back MI to win',
    layLabel: 'Lay MI to win',
    marketType: 'standard',
  },
];

const iplBallMarkets = Array.from({ length: 20 }, (_over, overIndex) =>
  Array.from({ length: 6 }, (_ball, ballIndex) => {
    const overNumber = overIndex + 1;
    const ballNumber = ballIndex + 1;
    const ballCode = overNumber + '-' + ballNumber;
    const ballLabel = overNumber + '.' + ballNumber;

    return ballOutcomeDefinitions.map((outcome) => ({
      slug: 'ipl-ball-' + ballCode + '-' + outcome.key,
      question: 'IPL Over ' + ballLabel + ' ' + outcome.label,
      match: 'Indian Premier League',
      marketLabel: 'Ball Outcome',
      outcomeLabel: outcome.description + ' occurs on ball ' + ballLabel,
      backLabel: 'Back ' + outcome.label + ' on ball ' + ballLabel,
      layLabel: 'Lay ' + outcome.label + ' on ball ' + ballLabel,
      marketType: 'ball',
      over: overNumber,
      ball: ballNumber,
      ballLabel,
      optionKey: outcome.key,
      optionLabel: outcome.label,
      optionOrder: outcome.sortOrder,
    }));
  }),
).flat(2);

export const configuredMarkets = [...baseMarkets, ...iplBallMarkets];

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
    marketType: definition?.marketType ?? 'standard',
    over: definition?.over ?? null,
    ball: definition?.ball ?? null,
    ballLabel: definition?.ballLabel ?? null,
    optionKey: definition?.optionKey ?? null,
    optionLabel: definition?.optionLabel ?? null,
    optionOrder: definition?.optionOrder ?? null,
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

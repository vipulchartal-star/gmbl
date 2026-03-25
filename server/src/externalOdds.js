const allowedRegions = new Set(['us', 'uk', 'eu', 'au']);
const allowedMarkets = new Set(['h2h', 'spreads', 'totals', 'outrights']);
const defaultBookmakers = ['betfair', 'matchbook', 'paddypower'];

const parseCsv = (value) =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const createProviderError = (message, extras = {}) => Object.assign(new Error(message), extras);

const ensureConfigured = (config) => {
  if (!config.oddsApiKey) {
    throw new Error('ODDS_API_NOT_CONFIGURED');
  }
};

const fetchJson = async (url) => {
  let response;

  try {
    response = await fetch(url);
  } catch (cause) {
    throw createProviderError('ODDS_API_REQUEST_FAILED', {
      status: 502,
      payload: { message: cause instanceof Error ? cause.message : 'Unknown network error.' },
    });
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw createProviderError('ODDS_API_REQUEST_FAILED', {
      status: response.status,
      payload,
    });
  }

  return { response, payload };
};

const sanitizeOutcome = (outcome) => ({
  name: String(outcome?.name ?? ''),
  price: Number(outcome?.price ?? 0),
  ...(Number.isFinite(Number(outcome?.point)) ? { point: Number(outcome.point) } : {}),
});

const sanitizeMarket = (market) => ({
  key: String(market?.key ?? ''),
  lastUpdate: String(market?.last_update ?? market?.lastUpdate ?? ''),
  outcomes: Array.isArray(market?.outcomes) ? market.outcomes.map(sanitizeOutcome) : [],
});

const sanitizeBookmaker = (bookmaker) => ({
  key: String(bookmaker?.key ?? ''),
  title: String(bookmaker?.title ?? ''),
  lastUpdate: String(bookmaker?.last_update ?? bookmaker?.lastUpdate ?? ''),
  markets: Array.isArray(bookmaker?.markets) ? bookmaker.markets.map(sanitizeMarket) : [],
});

const sanitizeEvent = (event) => ({
  id: String(event?.id ?? ''),
  sportKey: String(event?.sport_key ?? event?.sportKey ?? ''),
  sportTitle: String(event?.sport_title ?? event?.sportTitle ?? ''),
  commenceTime: String(event?.commence_time ?? event?.commenceTime ?? ''),
  homeTeam: String(event?.home_team ?? event?.homeTeam ?? ''),
  awayTeam: String(event?.away_team ?? event?.awayTeam ?? ''),
  bookmakers: Array.isArray(event?.bookmakers) ? event.bookmakers.map(sanitizeBookmaker) : [],
});

const sanitizeSport = (sport) => ({
  key: String(sport?.key ?? ''),
  group: String(sport?.group ?? ''),
  title: String(sport?.title ?? ''),
  description: String(sport?.description ?? ''),
  active: Boolean(sport?.active),
  hasOutrights: Boolean(sport?.has_outrights ?? sport?.hasOutrights),
});

export const buildOddsApiSportsUrl = (config) => {
  ensureConfigured(config);

  const url = new URL(`${config.oddsApiBaseUrl}/sports`);
  url.searchParams.set('apiKey', config.oddsApiKey);
  return url;
};

export const buildOddsApiOddsUrl = (config, query = {}) => {
  ensureConfigured(config);

  const sport = String(query.sport ?? 'cricket_ipl').trim() || 'cricket_ipl';
  const regionList = parseCsv(query.regions);
  const marketList = parseCsv(query.markets);
  const bookmakerList = parseCsv(query.bookmakers);
  const eventIdList = parseCsv(query.eventIds);

  const regions = (regionList.length ? regionList : ['uk']).filter((region) => allowedRegions.has(region)).join(',') || 'uk';
  const markets = (marketList.length ? marketList : ['h2h']).filter((market) => allowedMarkets.has(market)).join(',') || 'h2h';
  const bookmakers = bookmakerList.length ? bookmakerList.join(',') : defaultBookmakers.join(',');
  const oddsFormat = query.oddsFormat === 'american' ? 'american' : 'decimal';
  const dateFormat = query.dateFormat === 'unix' ? 'unix' : 'iso';

  const url = new URL(`${config.oddsApiBaseUrl}/sports/${sport}/odds`);
  url.searchParams.set('apiKey', config.oddsApiKey);
  url.searchParams.set('regions', regions);
  url.searchParams.set('markets', markets);
  url.searchParams.set('oddsFormat', oddsFormat);
  url.searchParams.set('dateFormat', dateFormat);
  url.searchParams.set('bookmakers', bookmakers);

  if (eventIdList.length) {
    url.searchParams.set('eventIds', eventIdList.join(','));
  }

  return url;
};

export const fetchExternalSports = async (config) => {
  const url = buildOddsApiSportsUrl(config);
  const { payload } = await fetchJson(url);

  return {
    sports: Array.isArray(payload) ? payload.map(sanitizeSport) : [],
  };
};

export const fetchExternalOdds = async (config, query = {}) => {
  const url = buildOddsApiOddsUrl(config, query);
  const { response, payload } = await fetchJson(url);

  return {
    sport: String(query.sport ?? 'cricket_ipl').trim() || 'cricket_ipl',
    regions: url.searchParams.get('regions'),
    markets: url.searchParams.get('markets'),
    bookmakers: url.searchParams.get('bookmakers'),
    oddsFormat: url.searchParams.get('oddsFormat'),
    dateFormat: url.searchParams.get('dateFormat'),
    events: Array.isArray(payload) ? payload.map(sanitizeEvent) : [],
    usage: {
      remainingRequests: Number(response.headers.get('x-requests-remaining') ?? 0),
      usedRequests: Number(response.headers.get('x-requests-used') ?? 0),
    },
  };
};

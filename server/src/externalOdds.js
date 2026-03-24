const allowedRegions = new Set(['us', 'uk', 'eu', 'au']);
const allowedMarkets = new Set(['h2h', 'spreads', 'totals', 'outrights']);

const defaultBookmakers = ['betfair', 'matchbook', 'paddypower'];

const parseCsv = (value) =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const buildOddsApiUrl = (config, query = {}) => {
  if (!config.oddsApiKey) {
    throw new Error('ODDS_API_NOT_CONFIGURED');
  }

  const sport = String(query.sport ?? 'cricket_ipl').trim() || 'cricket_ipl';
  const regionList = parseCsv(query.regions);
  const marketList = parseCsv(query.markets);
  const bookmakerList = parseCsv(query.bookmakers);

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

  return url;
};

export const fetchExternalOdds = async (config, query = {}) => {
  const url = buildOddsApiUrl(config, query);
  const response = await fetch(url);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error('ODDS_API_REQUEST_FAILED');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return {
    sport: String(query.sport ?? 'cricket_ipl').trim() || 'cricket_ipl',
    regions: url.searchParams.get('regions'),
    markets: url.searchParams.get('markets'),
    bookmakers: url.searchParams.get('bookmakers'),
    oddsFormat: url.searchParams.get('oddsFormat'),
    dateFormat: url.searchParams.get('dateFormat'),
    events: Array.isArray(payload) ? payload : [],
  };
};

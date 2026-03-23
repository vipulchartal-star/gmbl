export type AuthMode = 'login' | 'signup';
export type BetDirection = 'back' | 'lay';
export type ApiBetSide = 'yes' | 'no';
export type BetChoiceKey = 'back' | 'lay';

export type BetChoice = {
  direction: BetDirection;
  apiSide: ApiBetSide;
  odds: number;
  label: string;
  meaning: string;
  winText: string;
};

export type BetCard = {
  id: string;
  match: string;
  market: string;
  marketSlug: string;
  outcomeLabel: string;
  back: BetChoice;
  lay: BetChoice;
};

export type SessionUser = {
  id: string;
  loginId: string;
  username: string;
  balance: number;
};

export type SessionState = {
  token: string;
  user: SessionUser;
};

export type AuthResponse = {
  token: string;
  user: SessionUser;
};

export type MeResponse = {
  user: SessionUser;
};

export type Market = {
  slug: string;
  question: string;
  match: string;
  marketLabel: string;
  outcomeLabel: string;
  backLabel: string;
  layLabel: string;
  status: string;
  yesPool: number;
  noPool: number;
  totalPool: number;
  totalBets: number;
  yesOdds: number;
  noOdds: number;
  settledSide?: ApiBetSide | null;
  settledAt?: string | null;
  updatedAt: string;
};

export type MarketsResponse = {
  markets: Market[];
};

export type BetSlip = {
  id: string;
  marketSlug: string;
  side: ApiBetSide;
  amount: number;
  odds: number;
  createdAt: string;
};

export type MyBetsResponse = {
  bets: BetSlip[];
};

export type BetResponse = {
  balance: number;
  market: Market;
  bet: BetSlip;
};

export const chipAmounts = [10, 25, 50, 100];
export const sessionKey = 'gmbl-api-session';

const backMeaning = (outcomeLabel: string) => 'Back means you are betting for ' + outcomeLabel.toLowerCase() + '.';
const backWinText = (outcomeLabel: string) => 'You win if ' + outcomeLabel.toLowerCase() + '. You lose if that does not happen.';
const layMeaning = (outcomeLabel: string) => 'Lay means you are betting against ' + outcomeLabel.toLowerCase() + '.';
const layWinText = (outcomeLabel: string) => 'You win if ' + outcomeLabel.toLowerCase() + ' does not happen. You lose if it does happen.';

export const buildBetCards = (markets: Market[]): BetCard[] =>
  markets.map((market) => ({
    id: market.slug,
    match: market.match,
    market: market.marketLabel,
    marketSlug: market.slug,
    outcomeLabel: market.outcomeLabel,
    back: {
      direction: 'back',
      apiSide: 'yes',
      odds: market.yesOdds,
      label: market.backLabel,
      meaning: backMeaning(market.outcomeLabel),
      winText: backWinText(market.outcomeLabel),
    },
    lay: {
      direction: 'lay',
      apiSide: 'no',
      odds: market.noOdds,
      label: market.layLabel,
      meaning: layMeaning(market.outcomeLabel),
      winText: layWinText(market.outcomeLabel),
    },
  }));

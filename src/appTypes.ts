export type AuthMode = 'login' | 'signup';
export type BetDirection = 'back' | 'lay';
export type ApiBetSide = 'yes' | 'no';

export type BetListItem = {
  id: string;
  match: string;
  market: string;
  marketSlug: string;
  side: BetDirection;
  apiSide: ApiBetSide;
  label: string;
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
  status: string;
  yesPool: number;
  noPool: number;
  totalPool: number;
  totalBets: number;
  updatedAt: string;
};

export type BetResponse = {
  balance: number;
  market: Market;
  bet: {
    id: string;
    marketSlug: string;
    side: ApiBetSide;
    amount: number;
    createdAt: string;
  };
};

export const chipAmounts = [10, 25, 50, 100];
export const sessionKey = 'gmbl-api-session';

export const betList: BetListItem[] = [
  {
    id: 'mi-vs-kkr-toss-back',
    match: 'MI vs KKR',
    market: 'Toss',
    marketSlug: 'mi-vs-kkr-toss',
    side: 'back',
    apiSide: 'yes',
    label: 'MI vs KKR Toss Back',
  },
  {
    id: 'mi-vs-kkr-toss-lay',
    match: 'MI vs KKR',
    market: 'Toss',
    marketSlug: 'mi-vs-kkr-toss',
    side: 'lay',
    apiSide: 'no',
    label: 'MI vs KKR Toss Lay',
  },
  {
    id: 'mi-vs-kkr-bookmaker-back',
    match: 'MI vs KKR',
    market: 'Bookmaker',
    marketSlug: 'mi-vs-kkr-bookmaker',
    side: 'back',
    apiSide: 'yes',
    label: 'MI vs KKR Bookmaker Back',
  },
  {
    id: 'mi-vs-kkr-bookmaker-lay',
    match: 'MI vs KKR',
    market: 'Bookmaker',
    marketSlug: 'mi-vs-kkr-bookmaker',
    side: 'lay',
    apiSide: 'no',
    label: 'MI vs KKR Bookmaker Lay',
  },
  {
    id: 'mi-vs-kkr-match-odds-back',
    match: 'MI vs KKR',
    market: 'Match Odds',
    marketSlug: 'mi-vs-kkr-match-odds',
    side: 'back',
    apiSide: 'yes',
    label: 'MI vs KKR Match Odds Back',
  },
  {
    id: 'mi-vs-kkr-match-odds-lay',
    match: 'MI vs KKR',
    market: 'Match Odds',
    marketSlug: 'mi-vs-kkr-match-odds',
    side: 'lay',
    apiSide: 'no',
    label: 'MI vs KKR Match Odds Lay',
  },
];

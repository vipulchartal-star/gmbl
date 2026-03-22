export type BetSide = 'yes' | 'no';
export type AuthMode = 'login' | 'signup';

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

export type MarketResponse = {
  market: Market;
};

export type MeResponse = {
  user: SessionUser;
};

export type BetResponse = {
  balance: number;
  market: Market;
};

export const chipAmounts = [10, 25, 50, 100];
export const sessionKey = 'gmbl-api-session';
export const pollMs = 4000;

export const emptyMarket: Market = {
  slug: 'live-yes-no',
  question: 'Will the outcome be YES?',
  status: 'open',
  yesPool: 0,
  noPool: 0,
  totalPool: 0,
  totalBets: 0,
  updatedAt: '',
};

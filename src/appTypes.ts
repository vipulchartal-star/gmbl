export type AuthMode = 'login' | 'signup';
export type BetDirection = 'back' | 'lay';

export type BetListItem = {
  id: string;
  match: string;
  market: string;
  side: BetDirection;
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

export const sessionKey = 'gmbl-api-session';

export const betList: BetListItem[] = [
  {
    id: 'mi-vs-kkr-toss-back',
    match: 'MI vs KKR',
    market: 'Toss',
    side: 'back',
    label: 'MI vs KKR Toss Back',
  },
  {
    id: 'mi-vs-kkr-toss-lay',
    match: 'MI vs KKR',
    market: 'Toss',
    side: 'lay',
    label: 'MI vs KKR Toss Lay',
  },
  {
    id: 'mi-vs-kkr-bookmaker-back',
    match: 'MI vs KKR',
    market: 'Bookmaker',
    side: 'back',
    label: 'MI vs KKR Bookmaker Back',
  },
  {
    id: 'mi-vs-kkr-bookmaker-lay',
    match: 'MI vs KKR',
    market: 'Bookmaker',
    side: 'lay',
    label: 'MI vs KKR Bookmaker Lay',
  },
  {
    id: 'mi-vs-kkr-match-odds-back',
    match: 'MI vs KKR',
    market: 'Match Odds',
    side: 'back',
    label: 'MI vs KKR Match Odds Back',
  },
  {
    id: 'mi-vs-kkr-match-odds-lay',
    match: 'MI vs KKR',
    market: 'Match Odds',
    side: 'lay',
    label: 'MI vs KKR Match Odds Lay',
  },
];

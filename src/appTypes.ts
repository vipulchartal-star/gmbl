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

export const betCards: BetCard[] = [
  {
    id: 'mi-vs-kkr-toss',
    match: 'MI vs KKR',
    market: 'Toss',
    marketSlug: 'mi-vs-kkr-toss',
    outcomeLabel: 'MI wins the toss',
    back: {
      direction: 'back',
      apiSide: 'yes',
      odds: 1.9,
      label: 'Back MI to win the toss',
      meaning: 'Back means you are betting for MI to win the toss.',
      winText: 'You win if MI wins the toss. You lose if MI does not win the toss.',
    },
    lay: {
      direction: 'lay',
      apiSide: 'no',
      odds: 1.92,
      label: 'Lay MI to win the toss',
      meaning: 'Lay means you are betting against MI winning the toss.',
      winText: 'You win if MI does not win the toss. You lose if MI wins the toss.',
    },
  },
  {
    id: 'mi-vs-kkr-bookmaker',
    match: 'MI vs KKR',
    market: 'Bookmaker',
    marketSlug: 'mi-vs-kkr-bookmaker',
    outcomeLabel: 'MI wins the match',
    back: {
      direction: 'back',
      apiSide: 'yes',
      odds: 2.18,
      label: 'Back MI to win',
      meaning: 'Back means you are betting for MI to win the match.',
      winText: 'You win if MI wins the match. You lose if MI does not win the match.',
    },
    lay: {
      direction: 'lay',
      apiSide: 'no',
      odds: 1.78,
      label: 'Lay MI to win',
      meaning: 'Lay means you are betting against MI winning the match.',
      winText: 'You win if MI does not win the match. You lose if MI wins the match.',
    },
  },
  {
    id: 'mi-vs-kkr-match-odds',
    match: 'MI vs KKR',
    market: 'Match Odds',
    marketSlug: 'mi-vs-kkr-match-odds',
    outcomeLabel: 'MI wins the match',
    back: {
      direction: 'back',
      apiSide: 'yes',
      odds: 2.06,
      label: 'Back MI to win',
      meaning: 'Back means you are betting for MI to win the match.',
      winText: 'You win if MI wins the match. You lose if MI does not win the match.',
    },
    lay: {
      direction: 'lay',
      apiSide: 'no',
      odds: 1.84,
      label: 'Lay MI to win',
      meaning: 'Lay means you are betting against MI winning the match.',
      winText: 'You win if MI does not win the match. You lose if MI wins the match.',
    },
  },
];

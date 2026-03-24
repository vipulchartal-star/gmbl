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

export type BetOption = {
  id: string;
  marketSlug: string;
  optionLabel: string;
  outcomeLabel: string;
  back: BetChoice;
  lay: BetChoice;
};

export type BetCard = {
  id: string;
  match: string;
  market: string;
  title: string;
  subtitle: string;
  options: BetOption[];
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
  marketType: string;
  over?: number | null;
  ball?: number | null;
  ballLabel?: string | null;
  optionKey?: string | null;
  optionLabel?: string | null;
  optionOrder?: number | null;
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


export type ExternalOddsOutcome = {
  name: string;
  price: number;
  point?: number;
};

export type ExternalOddsMarket = {
  key: string;
  lastUpdate: string;
  outcomes: ExternalOddsOutcome[];
};

export type ExternalOddsBookmaker = {
  key: string;
  title: string;
  lastUpdate: string;
  markets: ExternalOddsMarket[];
};

export type ExternalOddsEvent = {
  id: string;
  sportKey: string;
  sportTitle: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  bookmakers: ExternalOddsBookmaker[];
};

export type ExternalOddsResponse = {
  sport: string;
  regions: string | null;
  markets: string | null;
  bookmakers: string | null;
  oddsFormat: string | null;
  dateFormat: string | null;
  events: ExternalOddsEvent[];
};

export const chipAmounts = [10, 25, 50, 100];
export const sessionKey = 'gmbl-api-session';

const backMeaning = (outcomeLabel: string) => 'Back means you are betting for ' + outcomeLabel.toLowerCase() + '.';
const backWinText = (outcomeLabel: string) => 'You win if ' + outcomeLabel.toLowerCase() + '. You lose if that does not happen.';
const layMeaning = (outcomeLabel: string) => 'Lay means you are betting against ' + outcomeLabel.toLowerCase() + '.';
const layWinText = (outcomeLabel: string) => 'You win if ' + outcomeLabel.toLowerCase() + ' does not happen. You lose if it does happen.';

const compareMarkets = (left: Market, right: Market) => {
  const leftBall = left.marketType === 'ball';
  const rightBall = right.marketType === 'ball';

  if (leftBall && !rightBall) {
    return 1;
  }

  if (!leftBall && rightBall) {
    return -1;
  }

  if (leftBall && rightBall) {
    const overDelta = (left.over ?? 0) - (right.over ?? 0);
    if (overDelta !== 0) {
      return overDelta;
    }

    const ballDelta = (left.ball ?? 0) - (right.ball ?? 0);
    if (ballDelta !== 0) {
      return ballDelta;
    }

    return (left.optionOrder ?? 0) - (right.optionOrder ?? 0);
  }

  return left.marketLabel.localeCompare(right.marketLabel);
};

export const buildBetCards = (markets: Market[]): BetCard[] => {
  const cards: BetCard[] = [];
  const groupedBallCards = new Map<string, BetCard>();
  const sortedMarkets = [...markets].sort(compareMarkets);

  for (const market of sortedMarkets) {
    const option: BetOption = {
      id: market.slug,
      marketSlug: market.slug,
      optionLabel: market.optionLabel ?? market.marketLabel,
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
    };

    if (market.marketType === 'ball' && market.over && market.ball) {
      const cardId = 'ball-' + market.over + '-' + market.ball;
      const existing = groupedBallCards.get(cardId);

      if (existing) {
        existing.options.push(option);
        continue;
      }

      const card: BetCard = {
        id: cardId,
        match: market.match,
        market: market.marketLabel,
        title: 'Over ' + market.over,
        subtitle: 'Ball ' + market.ball + ' • Choose the exact outcome for this delivery',
        options: [option],
      };

      groupedBallCards.set(cardId, card);
      cards.push(card);
      continue;
    }

    cards.push({
      id: market.slug,
      match: market.match,
      market: market.marketLabel,
      title: market.outcomeLabel,
      subtitle: 'Choose whether to back or lay this outcome.',
      options: [option],
    });
  }

  return cards;
};

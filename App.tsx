import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View } from 'react-native';

import { apiRequest, ApiError } from './src/api';
import { ActionBar, AuthPanel, TableCard, TopHud } from './src/appComponents';
import { styles } from './src/appStyles';
import { actorOrder, aiActors, coyoteDeck, startingLives, type CardMap, type RoundActor, type ScoreState } from './src/appTypes';
import { createGeneratedCredentials } from './src/credentials';
import { clearSessionToken, readSessionToken, writeSessionToken } from './src/sessionStore';

type RoundState = {
  cards: CardMap;
  currentBid: number;
  turn: RoundActor;
  lastBidder: RoundActor;
  lastRaiser: RoundActor | null;
  statusText: string;
  revealCards: boolean;
  awardTo: RoundActor | null;
};

type AuthMode = 'login' | 'signup';

type SessionUser = {
  id: string;
  loginId: string;
  username: string;
  balance: number;
};

type AuthResponse = {
  token: string;
  user: SessionUser;
};

type MeResponse = {
  user: SessionUser;
};

const averageUnknown = 4;
const turnDurationMs = 3200;
const initialScore: ScoreState = { ai1: startingLives, ai2: startingLives, ai3: startingLives, player: startingLives };

const pickCards = (): CardMap => {
  const deck = [...coyoteDeck];
  const result = {} as CardMap;

  for (const actor of actorOrder) {
    const index = Math.floor(Math.random() * deck.length);
    result[actor] = deck.splice(index, 1)[0];
  }

  return result;
};

const sumVisibleForActor = (cards: CardMap, actor: RoundActor) => actorOrder.reduce((total, current) => total + (current === actor ? 0 : cards[current].value), 0);
const sumAllCards = (cards: CardMap) => actorOrder.reduce((total, actor) => total + cards[actor].value, 0);
const nextActor = (actor: RoundActor) => actorOrder[(actorOrder.indexOf(actor) + 1) % actorOrder.length];
const nextBidChoices = (currentBid: number) => Array.from({ length: 4 }, (_, index) => currentBid + index + 1);
const allAiDefeated = (score: ScoreState) => aiActors.every((actor) => score[actor] <= 0);

const openingBidForAi1 = (cards: CardMap) => {
  const visibleTotal = sumVisibleForActor(cards, 'ai1');
  return Math.max(0, visibleTotal - 2);
};

const createRound = (): RoundState => {
  const cards = pickCards();

  return {
    cards,
    currentBid: openingBidForAi1(cards),
    turn: 'ai2',
    lastBidder: 'ai1',
    lastRaiser: 'ai1',
    statusText: 'AI1 opens the round.',
    revealCards: false,
    awardTo: null,
  };
};

const resolveRound = (current: RoundState, caller: RoundActor, bidder: RoundActor) => {
  const total = sumAllCards(current.cards);
  const bidWasTooHigh = current.currentBid > total;
  const loser = bidWasTooHigh ? bidder : caller;
  const winner = bidWasTooHigh ? caller : bidder;
  const winnerText = winner === 'player' ? 'You take the pot.' : winner.toUpperCase() + ' takes the pot.';

  return {
    loser,
    nextRound: {
      ...current,
      turn: 'player' as RoundActor,
      statusText: winnerText + ' Total was ' + total + '.',
      revealCards: true,
      awardTo: winner,
      lastRaiser: null,
    },
  };
};

const performAiTurn = (current: RoundState, score: ScoreState) => {
  const actor = current.turn;
  const visibleTotal = sumVisibleForActor(current.cards, actor);
  const threshold = visibleTotal + averageUnknown + (current.cards[actor].value >= 7 ? 1 : 0);

  if (current.currentBid >= threshold) {
    const resolved = resolveRound(current, actor, current.lastBidder);
    return {
      nextScore: {
        ...score,
        [resolved.loser]: Math.max(0, score[resolved.loser] - 1),
      },
      nextRound: resolved.nextRound,
    };
  }

  const raisedBid = Math.max(current.currentBid + 1, Math.min(current.currentBid + 2, threshold));

  return {
    nextScore: score,
    nextRound: {
      ...current,
      currentBid: raisedBid,
      lastBidder: actor,
      lastRaiser: actor,
      turn: nextActor(actor),
      statusText: actor.toUpperCase() + ' raises to ' + raisedBid + '.',
      awardTo: null,
    },
  };
};

const authErrorText = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Request failed.';
};

export default function App() {
  const [score, setScore] = useState<ScoreState>(initialScore);
  const [round, setRound] = useState<RoundState>(() => createRound());
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [turnStartedAt, setTurnStartedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  const gameOver = score.player <= 0 || allAiDefeated(score);
  const showReveal = round.revealCards || gameOver;
  const disabled = round.turn !== 'player' || showReveal;
  const bidChoices = useMemo(() => nextBidChoices(round.currentBid), [round.currentBid]);
  const elapsedMs = showReveal ? turnDurationMs : Math.min(turnDurationMs, Math.max(0, now - turnStartedAt));
  const timeRemainingMs = Math.max(0, turnDurationMs - elapsedMs);
  const turnProgress = timeRemainingMs / turnDurationMs;

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const savedToken = await readSessionToken();

        if (!savedToken) {
          return;
        }

        const payload = await apiRequest<MeResponse>('/me', { token: savedToken });

        if (!cancelled) {
          setSessionUser(payload.user);
        }
      } catch {
        await clearSessionToken();
        if (!cancelled) {
          setSessionUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setTurnStartedAt(Date.now());
    setNow(Date.now());
  }, [round.turn, round.revealCards, round.currentBid]);

  useEffect(() => {
    if (showReveal || !sessionUser) {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 120);

    return () => clearInterval(interval);
  }, [sessionUser, showReveal, round.turn, round.currentBid]);

  useEffect(() => {
    if (!sessionUser || round.revealCards || gameOver) {
      return;
    }

    const timeout = setTimeout(() => {
      if (round.turn === 'player') {
        const resolved = resolveRound(round, 'player', round.lastBidder);
        setScore((current) => ({
          ...current,
          [resolved.loser]: Math.max(0, current[resolved.loser] - 1),
        }));
        setRound(resolved.nextRound);
        return;
      }

      const result = performAiTurn(round, score);
      setScore(result.nextScore);
      setRound(result.nextRound);
    }, timeRemainingMs);

    return () => clearTimeout(timeout);
  }, [gameOver, round, score, sessionUser, timeRemainingMs]);

  const handleGenerateCredentials = () => {
    const generated = createGeneratedCredentials();
    setAuthMode('signup');
    setLoginId(generated.loginId);
    setPassword(generated.password);
    setAuthError(null);
  };

  const handleAuthSubmit = async () => {
    if (!loginId.trim() || !password) {
      setAuthError('Enter login id and password.');
      return;
    }

    setAuthSubmitting(true);
    setAuthError(null);

    try {
      const payload = await apiRequest<AuthResponse>(authMode === 'login' ? '/auth/login' : '/auth/signup', {
        method: 'POST',
        body: {
          loginId: loginId.trim().toLowerCase(),
          password,
        },
      });

      await writeSessionToken(payload.token);
      setSessionUser(payload.user);
      setLoginId(payload.user.loginId);
      setPassword('');
      setRound(createRound());
      setScore(initialScore);
    } catch (error) {
      setAuthError(authErrorText(error));
    } finally {
      setAuthSubmitting(false);
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearSessionToken();
    setSessionUser(null);
    setPassword('');
    setAuthError(null);
    setRound(createRound());
    setScore(initialScore);
  };

  const handleRaise = (bid: number) => {
    setRound((current) => ({
      ...current,
      currentBid: bid,
      lastBidder: 'player',
      lastRaiser: 'player',
      turn: 'ai1',
      statusText: 'You raise to ' + bid + '.',
      awardTo: null,
    }));
  };

  const handleCall = () => {
    const resolved = resolveRound(round, 'player', round.lastBidder);
    setScore((current) => ({
      ...current,
      [resolved.loser]: Math.max(0, current[resolved.loser] - 1),
    }));
    setRound(resolved.nextRound);
  };

  const handleNextRound = () => {
    if (gameOver) {
      setScore(initialScore);
    }

    setRound(createRound());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.gameScreen}>
        {sessionUser ? <TopHud loginId={sessionUser.loginId} balance={sessionUser.balance} onLogout={handleLogout} /> : null}
        <TableCard
          score={score}
          cards={round.cards}
          currentBid={round.currentBid}
          turn={round.turn}
          statusText={gameOver ? (score.player <= 0 ? 'You are out. Deal again.' : 'All AI are out. Deal again.') : round.statusText}
          revealPlayerCard={showReveal}
          awardTo={showReveal ? round.awardTo : null}
          lastRaiser={round.lastRaiser}
          turnProgress={turnProgress}
        />
        {sessionUser ? (
          <ActionBar
            disabled={disabled}
            showNextRound={showReveal}
            nextBids={bidChoices}
            onRaise={handleRaise}
            onCall={handleCall}
            onNextRound={handleNextRound}
          />
        ) : null}
        {!sessionUser && !authLoading ? (
          <AuthPanel
            mode={authMode}
            loginId={loginId}
            password={password}
            loading={authSubmitting}
            error={authError}
            onChangeMode={setAuthMode}
            onChangeLoginId={setLoginId}
            onChangePassword={setPassword}
            onGenerateCredentials={handleGenerateCredentials}
            onSubmit={handleAuthSubmit}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

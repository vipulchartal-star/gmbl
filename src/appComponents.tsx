import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, TextInput, View } from 'react-native';

import { styles } from './appStyles';
import { type CardMap, type RoundActor, type ScoreState } from './appTypes';

type AuthMode = 'login' | 'signup';

function LifeTrack({ count, tone }: { count: number; tone: 'player' | 'ai' }) {
  return (
    <View style={styles.lifeTrack}>
      {Array.from({ length: 3 }, (_, index) => {
        const active = index < count;
        return <View key={tone + String(index)} style={[styles.lifePip, tone === 'player' ? styles.lifePipPlayer : styles.lifePipAi, !active ? styles.lifePipEmpty : null]} />;
      })}
    </View>
  );
}

function CardVisual({ label, value, hidden, angle }: { label: string; value: number; hidden: boolean; angle: string }) {
  return (
    <View style={[styles.gameCard, hidden ? styles.gameCardBack : styles.gameCardFront, { transform: [{ rotate: angle }] }]}> 
      <Text style={[styles.gameCardCorner, hidden ? styles.gameCardBackText : styles.gameCardFrontText]}>{hidden ? 'COYOTE' : label}</Text>
      <Text style={[styles.gameCardCenter, hidden ? styles.gameCardBackText : styles.gameCardFrontText]}>{hidden ? '?' : label}</Text>
      <Text style={[styles.gameCardValue, hidden ? styles.gameCardBackText : styles.gameCardFrontSubtext]}>{hidden ? 'Hidden' : (value >= 0 ? '+' : '') + String(value)}</Text>
    </View>
  );
}

function CoinStack({ bid }: { bid: number }) {
  const stackCount = Math.max(3, Math.min(8, Math.ceil(bid / 4)));

  return (
    <View style={styles.coinStack} pointerEvents="none">
      {Array.from({ length: stackCount }, (_, index) => (
        <View
          key={String(index)}
          style={[
            styles.coin,
            index % 2 === 0 ? styles.coinWarm : styles.coinBright,
            { bottom: index * 6, transform: [{ translateX: index % 2 === 0 ? -6 : 6 }] },
          ]}
        />
      ))}
    </View>
  );
}

function BetTravel({ actor, bid }: { actor: RoundActor | null; bid: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);

    if (!actor) {
      return;
    }

    Animated.timing(progress, {
      toValue: 1,
      duration: 340,
      useNativeDriver: true,
    }).start();
  }, [actor, bid, progress]);

  if (!actor) {
    return null;
  }

  const source = actor === 'player' ? { x: 0, y: 146 } : actor === 'ai1' ? { x: 0, y: -144 } : actor === 'ai2' ? { x: -150, y: -4 } : { x: 150, y: -4 };
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [source.x, 0] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [source.y, 0] });
  const scale = progress.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.7, 1, 0.92] });
  const opacity = progress.interpolate({ inputRange: [0, 0.9, 1], outputRange: [0, 1, 0.15] });

  return <Animated.View style={[styles.betTrailCoin, { transform: [{ translateX }, { translateY }, { scale }], opacity }]} pointerEvents="none" />;
}

function PotStack({ bid, awardTo, statusText }: { bid: number; awardTo: RoundActor | null; statusText: string }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);

    if (!awardTo) {
      return;
    }

    Animated.timing(progress, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }).start();
  }, [awardTo, bid, progress]);

  const target = awardTo === 'player' ? { x: 0, y: 156 } : awardTo === 'ai1' ? { x: 0, y: -154 } : awardTo === 'ai2' ? { x: -158, y: 4 } : { x: 158, y: 4 };
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, target.x] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, target.y] });
  const scale = progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1.04, 0.88] });
  const opacity = progress.interpolate({ inputRange: [0, 0.82, 1], outputRange: [1, 1, 0.08] });

  return (
    <Animated.View style={[styles.centerArena, { transform: [{ translateX }, { translateY }, { scale }], opacity }]} pointerEvents="none">
      <CoinStack bid={bid} />
      <View style={styles.centerPot}>
        <Text style={styles.centerPotLabel}>Bid</Text>
        <Text style={styles.centerPotValue}>{bid}</Text>
        <Text style={styles.centerPotTurn}>{statusText}</Text>
      </View>
    </Animated.View>
  );
}

function Seat({
  label,
  lives,
  tone,
  cardLabel,
  cardValue,
  hidden,
  angle,
  style,
}: {
  label: string;
  lives: number;
  tone: 'player' | 'ai';
  cardLabel: string;
  cardValue: number;
  hidden: boolean;
  angle: string;
  style: object;
}) {
  return (
    <View style={style}>
      <Text style={styles.seatLabel}>{label}</Text>
      <LifeTrack count={lives} tone={tone} />
      <CardVisual label={cardLabel} value={cardValue} hidden={hidden} angle={angle} />
    </View>
  );
}

export function TopHud({ loginId, balance, onLogout }: { loginId: string; balance: number; onLogout: () => void }) {
  return (
    <View style={styles.topHud}>
      <View style={styles.topHudBadge}>
        <Text style={styles.topHudLabel}>Player</Text>
        <Text style={styles.topHudValue}>@{loginId}</Text>
      </View>
      <View style={styles.topHudBadge}>
        <Text style={styles.topHudLabel}>Wallet</Text>
        <Text style={styles.topHudValue}>${balance.toFixed(2)}</Text>
      </View>
      <Pressable style={styles.topHudLogout} onPress={onLogout}>
        <Text style={styles.topHudLogoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

export function AuthPanel({
  mode,
  loginId,
  password,
  loading,
  error,
  onChangeMode,
  onChangeLoginId,
  onChangePassword,
  onGenerateCredentials,
  onSubmit,
}: {
  mode: AuthMode;
  loginId: string;
  password: string;
  loading: boolean;
  error: string | null;
  onChangeMode: (mode: AuthMode) => void;
  onChangeLoginId: (value: string) => void;
  onChangePassword: (value: string) => void;
  onGenerateCredentials: () => void;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.authOverlay}>
      <View style={styles.authPanel}>
        <Text style={styles.authEyebrow}>Coyote Table</Text>
        <Text style={styles.authTitle}>{mode === 'login' ? 'Enter The Table' : 'Create A Player'}</Text>
        <Text style={styles.authBody}>{mode === 'login' ? 'Log in to restore your wallet and play.' : 'Create a login and start with your previous wallet flow.'}</Text>

        <View style={styles.authSwitchRow}>
          {mode === 'signup' ? (
            <Pressable style={styles.authGhostAction} onPress={onGenerateCredentials}>
              <Text style={styles.authGhostActionText}>Generate Login</Text>
            </Pressable>
          ) : null}
          <Pressable style={[styles.authSwitch, mode === 'login' ? styles.authSwitchActive : null]} onPress={() => onChangeMode('login')}>
            <Text style={[styles.authSwitchText, mode === 'login' ? styles.authSwitchTextActive : null]}>Login</Text>
          </Pressable>
          <Pressable style={[styles.authSwitch, mode === 'signup' ? styles.authSwitchActive : null]} onPress={() => onChangeMode('signup')}>
            <Text style={[styles.authSwitchText, mode === 'signup' ? styles.authSwitchTextActive : null]}>Sign Up</Text>
          </Pressable>
        </View>

        <View style={styles.authFieldGroup}>
          <Text style={styles.authFieldLabel}>Login ID</Text>
          <TextInput
            value={loginId}
            onChangeText={onChangeLoginId}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="player123"
            placeholderTextColor="#8d816d"
            style={styles.authInput}
          />
        </View>

        <View style={styles.authFieldGroup}>
          <Text style={styles.authFieldLabel}>Password</Text>
          <TextInput
            value={password}
            onChangeText={onChangePassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="minimum 6 characters"
            placeholderTextColor="#8d816d"
            style={styles.authInput}
          />
        </View>

        {error ? <Text style={styles.authError}>{error}</Text> : null}

        <Pressable style={[styles.authSubmit, loading ? styles.disabledAction : null]} disabled={loading} onPress={onSubmit}>
          <Text style={styles.authSubmitText}>{loading ? 'Connecting...' : mode === 'login' ? 'Login' : 'Create Account'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function TableCard({
  score,
  cards,
  currentBid,
  turn,
  statusText,
  revealPlayerCard,
  awardTo,
  lastRaiser,
}: {
  score: ScoreState;
  cards: CardMap;
  currentBid: number;
  turn: RoundActor;
  statusText: string;
  revealPlayerCard: boolean;
  awardTo: RoundActor | null;
  lastRaiser: RoundActor | null;
}) {
  const turnText = awardTo ? 'Pot moving' : turn === 'player' ? 'Your move' : turn.toUpperCase() + ' thinking';

  return (
    <View style={styles.tableShell}>
      <View style={styles.tableGlow} />
      <View style={styles.tableFelt}>
        <View style={styles.tableRail} />
        <View style={styles.tableInnerRing} />

        <Seat label="AI1" lives={score.ai1} tone="ai" cardLabel={cards.ai1.label} cardValue={cards.ai1.value} hidden={false} angle="-4deg" style={styles.aiTopSeat} />
        <Seat label="AI2" lives={score.ai2} tone="ai" cardLabel={cards.ai2.label} cardValue={cards.ai2.value} hidden={false} angle="-9deg" style={styles.aiLeftSeat} />
        <Seat label="AI3" lives={score.ai3} tone="ai" cardLabel={cards.ai3.label} cardValue={cards.ai3.value} hidden={false} angle="9deg" style={styles.aiRightSeat} />
        <Seat label="YOU" lives={score.player} tone="player" cardLabel={cards.player.label} cardValue={cards.player.value} hidden={!revealPlayerCard} angle="6deg" style={styles.playerSeat} />

        <BetTravel actor={lastRaiser} bid={currentBid} />
        <PotStack bid={currentBid} awardTo={awardTo} statusText={awardTo ? statusText : turnText} />
      </View>
    </View>
  );
}

export function ActionBar({
  disabled,
  showNextRound,
  nextBids,
  onRaise,
  onCall,
  onNextRound,
}: {
  disabled: boolean;
  showNextRound: boolean;
  nextBids: number[];
  onRaise: (bid: number) => void;
  onCall: () => void;
  onNextRound: () => void;
}) {
  if (showNextRound) {
    return (
      <View style={styles.actionBar}>
        <Pressable style={styles.nextRoundBarButton} onPress={onNextRound}>
          <Text style={styles.nextRoundBarButtonText}>Deal Next Round</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.actionBar}>
      <View style={styles.raiseRow}>
        {nextBids.map((bid) => (
          <Pressable key={bid} style={[styles.raiseChip, disabled ? styles.disabledAction : null]} disabled={disabled} onPress={() => onRaise(bid)}>
            <Text style={styles.raiseChipValue}>{bid}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={[styles.coyoteButton, disabled ? styles.disabledAction : null]} disabled={disabled} onPress={onCall}>
        <Text style={styles.coyoteButtonText}>COYOTE</Text>
      </Pressable>
    </View>
  );
}

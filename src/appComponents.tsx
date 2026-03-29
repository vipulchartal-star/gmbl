import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, TextInput, View, type DimensionValue } from 'react-native';

import { styles } from './appStyles';
import { type CardMap, type RoundActor, type ScoreState } from './appTypes';
import { WalletBackgroundCoin, WalletCoin } from './walletCoin';

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

function CardPlaceholder({ angle }: { angle: string }) {
  return <View style={[styles.gameCard, styles.gameCardPlaceholder, { transform: [{ rotate: angle }] }]} />;
}

function DealBurst({ dealSequence }: { dealSequence: number }) {
  const progress = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    progress.forEach((value) => {
      value.stopAnimation();
      value.setValue(0);
    });

    Animated.stagger(
      110,
      progress.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [dealSequence, progress]);

  const targets = [
    { x: 0, y: -170, rotate: '-8deg' },
    { x: -172, y: -4, rotate: '-14deg' },
    { x: 0, y: 170, rotate: '8deg' },
    { x: 172, y: -4, rotate: '14deg' },
  ];

  return (
    <View style={styles.dealBurstLayer} pointerEvents="none">
      {progress.map((value, index) => {
        const target = targets[index];
        const translateX = value.interpolate({ inputRange: [0, 1], outputRange: [0, target.x] });
        const translateY = value.interpolate({ inputRange: [0, 1], outputRange: [0, target.y] });
        const scale = value.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0.55, 1.05, 1] });
        const opacity = value.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] });

        return (
          <Animated.View
            key={String(index)}
            style={[
              styles.dealCard,
              {
                opacity,
                transform: [{ translateX }, { translateY }, { rotate: target.rotate }, { scale }],
              },
            ]}
          >
            <View style={[styles.gameCard, styles.gameCardBack, styles.dealCardFace]}>
              <Text style={[styles.gameCardCorner, styles.gameCardBackText]}>COYOTE</Text>
              <Text style={[styles.gameCardCenter, styles.gameCardBackText]}>?</Text>
              <Text style={[styles.gameCardValue, styles.gameCardBackText]}>Deal</Text>
            </View>
          </Animated.View>
        );
      })}
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

function TurnTimer({ actor, progress }: { actor: RoundActor; progress: number }) {
  const position = useRef(new Animated.ValueXY(actor === 'ai1' ? { x: 88, y: -190 } : actor === 'ai2' ? { x: -168, y: -4 } : actor === 'ai3' ? { x: 168, y: -4 } : { x: 0, y: 194 })).current;

  useEffect(() => {
    const target = actor === 'ai1' ? { x: 88, y: -190 } : actor === 'ai2' ? { x: -168, y: -4 } : actor === 'ai3' ? { x: 168, y: -4 } : { x: 0, y: 194 };

    Animated.spring(position, {
      toValue: target,
      tension: 120,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, [actor, position]);

  const clamped = Math.max(0, Math.min(1, progress));
  const rotation = String(Math.round((1 - clamped) * 360)) + 'deg';

  return (
    <Animated.View style={[styles.turnTimer, { transform: [{ translateX: position.x }, { translateY: position.y }] }]} pointerEvents="none">
      <View style={styles.turnTimerCrown} />
      <View style={styles.turnTimerButton} />
      <View style={styles.turnTimerShell}>
        <View style={styles.turnTimerInner}>
          <View style={styles.turnTimerTickTop} />
          <View style={styles.turnTimerTickRight} />
          <View style={styles.turnTimerTickBottom} />
          <View style={styles.turnTimerTickLeft} />
          <View style={[styles.turnTimerSweep, { transform: [{ rotate: rotation }] }]} />
          <View style={styles.turnTimerHub} />
        </View>
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
  activeText,
  dealing,
}: {
  label: string;
  lives: number;
  tone: 'player' | 'ai';
  cardLabel: string;
  cardValue: number;
  hidden: boolean;
  angle: string;
  style: object;
  activeText?: string | null;
  dealing?: boolean;
}) {
  return (
    <View style={style}>
      <Text style={styles.seatLabel}>{label}</Text>
      <LifeTrack count={lives} tone={tone} />
      {dealing ? <CardPlaceholder angle={angle} /> : <CardVisual label={cardLabel} value={cardValue} hidden={hidden} angle={angle} />}
      {activeText ? <Text style={styles.seatStatus}>{activeText}</Text> : null}
    </View>
  );
}

const walletSpreadSlots = [
  { left: '7%', top: '8%', rotate: '-12deg' },
  { left: '38%', top: '4%', rotate: '8deg' },
  { left: '66%', top: '14%', rotate: '-6deg' },
  { left: '14%', top: '42%', rotate: '10deg' },
  { left: '48%', top: '36%', rotate: '-10deg' },
  { left: '70%', top: '54%', rotate: '7deg' },
] satisfies Array<{ left: DimensionValue; top: DimensionValue; rotate: string }>;

const walletBackgroundCoins = [
  { left: '4%', top: '16%', rotate: '-18deg', size: 92, label: '$' },
  { left: '70%', top: '18%', rotate: '14deg', size: 76, label: 'G' },
  { left: '18%', top: '48%', rotate: '-10deg', size: 86, label: '$' },
  { left: '76%', top: '56%', rotate: '10deg', size: 98, label: 'W' },
  { left: '42%', top: '70%', rotate: '-16deg', size: 80, label: '$' },
] satisfies Array<{ left: DimensionValue; top: DimensionValue; rotate: string; size: number; label: string }>;

const mockWalletActivity = [
  { id: 'mock-deposit-1', kind: 'Deposit', amount: '+$120.00', meta: 'USDC top-up 5 min ago' },
  { id: 'mock-withdraw-1', kind: 'Withdraw', amount: '-$35.00', meta: 'Sent to saved wallet 1 hr ago' },
  { id: 'mock-deposit-2', kind: 'Deposit', amount: '+$60.00', meta: 'Promo credit yesterday' },
];

export function TopHud({
  loginId,
  balance,
  walletOpen,
  onWalletPress,
  onLogout,
}: {
  loginId: string;
  balance: number;
  walletOpen: boolean;
  onWalletPress: () => void;
  onLogout: () => void;
}) {
  return (
    <View style={styles.topHud}>
      <View style={styles.topHudRow}>
        <View style={styles.topHudBadge}>
          <Text style={styles.topHudLabel}>Player</Text>
          <Text style={styles.topHudValue}>@{loginId}</Text>
        </View>
        <Pressable style={[styles.topHudBadge, walletOpen ? styles.topHudBadgeActive : null]} onPress={onWalletPress}>
          <Text style={styles.topHudLabel}>Wallet</Text>
          <Text style={styles.topHudValue}>${balance.toFixed(2)}</Text>
        </Pressable>
        <Pressable style={styles.topHudLogout} onPress={onLogout}>
          <Text style={styles.topHudLogoutText}>Log Out</Text>
        </Pressable>
      </View>
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
  turnProgress,
  dealing,
  dealSequence,
}: {
  score: ScoreState;
  cards: CardMap;
  currentBid: number;
  turn: RoundActor;
  statusText: string;
  revealPlayerCard: boolean;
  awardTo: RoundActor | null;
  lastRaiser: RoundActor | null;
  turnProgress: number;
  dealing: boolean;
  dealSequence: number;
}) {
  const turnText = turn === 'player' ? 'Your move' : turn.toUpperCase() + ' thinking';

  return (
    <View style={styles.tableShell}>
      <View style={styles.tableGlow} />
      <View style={styles.tableFelt}>
        <View style={styles.tableRail} />
        <View style={styles.tableInnerRing} />

        <Seat label="AI1" lives={score.ai1} tone="ai" cardLabel={cards.ai1.label} cardValue={cards.ai1.value} hidden={false} angle="-4deg" style={styles.aiTopSeat} activeText={!awardTo && turn === 'ai1' ? turnText : null} dealing={dealing} />
        <Seat label="AI2" lives={score.ai2} tone="ai" cardLabel={cards.ai2.label} cardValue={cards.ai2.value} hidden={false} angle="-9deg" style={styles.aiLeftSeat} activeText={!awardTo && turn === 'ai2' ? turnText : null} dealing={dealing} />
        <Seat label="AI3" lives={score.ai3} tone="ai" cardLabel={cards.ai3.label} cardValue={cards.ai3.value} hidden={false} angle="9deg" style={styles.aiRightSeat} activeText={!awardTo && turn === 'ai3' ? turnText : null} dealing={dealing} />
        <Seat label="YOU" lives={score.player} tone="player" cardLabel={cards.player.label} cardValue={cards.player.value} hidden={!revealPlayerCard} angle="6deg" style={styles.playerSeat} activeText={!awardTo && turn === 'player' ? turnText : null} dealing={dealing} />

        {!awardTo && !dealing ? <TurnTimer actor={turn} progress={turnProgress} /> : null}
        <BetTravel actor={lastRaiser} bid={currentBid} />
        <PotStack bid={currentBid} awardTo={awardTo} statusText={awardTo ? statusText : ''} />
        {dealing ? <DealBurst dealSequence={dealSequence} /> : null}
      </View>
    </View>
  );
}

export function WalletPanel({
  balance,
  holdings,
  loading,
  view,
  withdrawAddress,
  withdrawAddressDraft,
  withdrawEditing,
  onChangeWithdrawAddress,
  onShowHoldings,
  onCopyAddress,
  onSaveWithdrawWallet,
  onEditWithdrawWallet,
  onSubmitWithdraw,
  onDeposit,
  onWithdraw,
}: {
  balance: number;
  holdings: Array<{
    id: string;
    marketSlug: string;
    side: 'yes' | 'no';
    amount: number;
    odds: number;
    createdAt: string;
  }>;
  loading: boolean;
  view: 'holdings' | 'deposit' | 'withdraw';
  withdrawAddress: string;
  withdrawAddressDraft: string;
  withdrawEditing: boolean;
  onChangeWithdrawAddress: (value: string) => void;
  onShowHoldings: () => void;
  onCopyAddress: () => void;
  onSaveWithdrawWallet: () => void;
  onEditWithdrawWallet: () => void;
  onSubmitWithdraw: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
}) {
  return (
    <View style={styles.walletPanelShell}>
      <View style={styles.walletPanelGlow} />
      <View style={styles.walletPanel}>
        <View pointerEvents="none" style={styles.walletBackgroundSpread}>
          {walletBackgroundCoins.map((coin, index) => (
            <View
              key={String(index)}
              style={[
                styles.walletBackgroundSpreadCoin,
                {
                  left: coin.left,
                  top: coin.top,
                  transform: [{ rotate: coin.rotate }],
                },
              ]}
            >
              <WalletBackgroundCoin size={coin.size} label={coin.label} />
            </View>
          ))}
        </View>
        <View style={styles.walletPanelHeader}>
          <View>
            <Text style={styles.walletPanelEyebrow}>
              {view === 'deposit' ? 'Deposit Instructions' : view === 'withdraw' ? 'Withdraw Instructions' : 'Wallet Holdings'}
            </Text>
            <Text style={styles.walletPanelBalance}>${balance.toFixed(2)}</Text>
          </View>
          <View style={styles.walletPanelActions}>
            <Pressable style={styles.walletActionButton} onPress={onDeposit}>
              <Text style={styles.walletActionButtonText}>Deposit</Text>
            </Pressable>
            <Pressable style={[styles.walletActionButton, styles.walletActionButtonSecondary]} onPress={onWithdraw}>
              <Text style={styles.walletActionButtonText}>Withdraw</Text>
            </Pressable>
          </View>
        </View>

        {view === 'deposit' ? (
          <View style={styles.walletInstructionPanel}>
            <Text style={styles.walletInstructionTitle}>How To Deposit</Text>
            <Text style={styles.walletInstructionBody}>1. Copy the Solana address below and send funds through your supported cashier flow.</Text>
            <Text style={styles.walletInstructionBody}>2. After payment is confirmed, your wallet balance will update here.</Text>
            <Text style={styles.walletInstructionBody}>3. If the credit does not appear, contact support with your player id and transfer receipt.</Text>
            <View style={styles.walletInstructionCode}>
              <Text style={styles.walletInstructionCodeLabel}>Solana Address</Text>
              <Text style={styles.walletInstructionCodeValue}>9xQeWvG816bUx9EPjHmaT23yvVMu6KfP9U9x7wG5x9hV</Text>
            </View>
            <Pressable style={styles.walletCopyButton} onPress={onCopyAddress}>
              <Text style={styles.walletCopyButtonText}>Copy Address</Text>
            </Pressable>
            <Pressable style={styles.walletSecondaryButton} onPress={onShowHoldings}>
              <Text style={styles.walletSecondaryButtonText}>Back To Wallet</Text>
            </Pressable>
          </View>
        ) : view === 'withdraw' ? (
          <View style={styles.walletInstructionPanel}>
            <Text style={styles.walletInstructionTitle}>How To Withdraw</Text>
            <Text style={styles.walletInstructionBody}>1. Paste your Solana wallet address in the box below.</Text>
            <Text style={styles.walletInstructionBody}>2. Review the destination carefully before submitting any cashout request.</Text>
            <Text style={styles.walletInstructionBody}>3. Once approved, funds will be sent to the saved address shown here.</Text>
            {withdrawEditing ? (
              <View style={styles.walletInputGroup}>
                <Text style={styles.walletInstructionCodeLabel}>Destination Wallet</Text>
                <TextInput
                  value={withdrawAddressDraft}
                  onChangeText={onChangeWithdrawAddress}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Paste Solana wallet address"
                  placeholderTextColor="#8fb8a6"
                  style={styles.walletAddressInput}
                />
              </View>
            ) : (
              <View style={styles.walletInstructionCode}>
                <Text style={styles.walletInstructionCodeLabel}>Saved Wallet</Text>
                <Text style={styles.walletInstructionCodeValue}>{withdrawAddress}</Text>
              </View>
            )}
            {withdrawEditing ? (
              <Pressable style={styles.walletCopyButton} onPress={onSaveWithdrawWallet}>
                <Text style={styles.walletCopyButtonText}>Save Wallet</Text>
              </Pressable>
            ) : (
              <View style={styles.walletWithdrawActionRow}>
                <Pressable style={[styles.walletRowButton, styles.walletRowButtonPrimary]} onPress={onSubmitWithdraw}>
                  <Text style={styles.walletCopyButtonText}>Withdraw</Text>
                </Pressable>
                <Pressable style={[styles.walletRowButton, styles.walletRowButtonSecondary]} onPress={onEditWithdrawWallet}>
                  <Text style={styles.walletSecondaryButtonText}>Edit Wallet</Text>
                </Pressable>
              </View>
            )}
            <Pressable style={styles.walletSecondaryButton} onPress={onShowHoldings}>
              <Text style={styles.walletSecondaryButtonText}>Back To Wallet</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.walletHoldingsView}>
            <View style={styles.walletSpread}>
              <View style={styles.walletSpreadRing} />
              {loading ? <Text style={styles.walletEmptyState}>Loading holdings...</Text> : null}
              {!loading && holdings.length === 0 ? <Text style={styles.walletEmptyState}>No wallet holdings yet.</Text> : null}
              {!loading
                ? holdings.slice(0, 6).map((holding, index) => {
                    const slot = walletSpreadSlots[index % walletSpreadSlots.length];

                    return (
                      <View
                        key={holding.id}
                        style={[
                          styles.walletSpreadCoinGroup,
                          {
                            left: slot.left,
                            top: slot.top,
                            transform: [{ rotate: slot.rotate }],
                          },
                        ]}
                      >
                        <WalletCoin side={holding.side} />
                        <View style={styles.walletSpreadMeta}>
                          <Text numberOfLines={1} style={styles.walletSpreadMarket}>
                            {holding.marketSlug}
                          </Text>
                          <Text style={styles.walletSpreadAmount}>${holding.amount.toFixed(2)} stake</Text>
                          <Text style={styles.walletSpreadReturn}>${(holding.amount * holding.odds).toFixed(2)} return</Text>
                        </View>
                      </View>
                    );
                  })
                : null}
            </View>
            <View style={styles.walletActivityPanel}>
              <Text style={styles.walletActivityTitle}>Mock Activity</Text>
              {mockWalletActivity.map((entry) => (
                <View key={entry.id} style={styles.walletActivityRow}>
                  <View style={styles.walletActivityTextBlock}>
                    <Text style={styles.walletActivityKind}>{entry.kind}</Text>
                    <Text style={styles.walletActivityMeta}>{entry.meta}</Text>
                  </View>
                  <Text style={[styles.walletActivityAmount, entry.kind === 'Deposit' ? styles.walletActivityAmountPositive : styles.walletActivityAmountNegative]}>
                    {entry.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
            <Text style={styles.raiseChipLabel}>Bid</Text>
            <Text style={styles.raiseChipValue}>{bid}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={[styles.coyoteButton, disabled ? styles.disabledAction : null]} disabled={disabled} onPress={onCall}>
        <Text style={styles.coyoteButtonEyebrow}>Bluff Break</Text>
        <View style={styles.coyoteButtonPlate}>
          <Text style={styles.coyoteButtonText}>DUMBSTOP</Text>
        </View>
      </Pressable>
    </View>
  );
}

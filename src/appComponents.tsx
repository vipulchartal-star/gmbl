import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { styles } from './appStyles';
import { chipAmounts, type AuthMode, type BetCard, type BetChoiceKey, type BetSlip, type Market, type SessionState } from './appTypes';

type HeaderProps = {
  authMode: AuthMode;
  session: SessionState | null;
};

export function ScreenHeader({ authMode, session }: HeaderProps) {
  return (
    <>
      <Text style={styles.eyebrow}>{session ? 'Swipe Bets' : 'Login'}</Text>
      <Text style={styles.title}>{session ? 'GMBL' : authMode === 'signup' ? 'Create Account' : 'Welcome Back'}</Text>
      <Text style={styles.subtitle}>
        {session
          ? 'One outcome per screen. Use the two action buttons to place Back or Lay instantly.'
          : authMode === 'signup'
            ? 'Create your account with only login id and password.'
            : 'Enter your login id and password. After login you can swipe through markets and place bets instantly.'}
      </Text>
    </>
  );
}

type AccountCardProps = {
  authBusy: boolean;
  authMode: AuthMode;
  loginId: string;
  onChangeLoginId: (value: string) => void;
  onChangePassword: (value: string) => void;
  onGenerateCredentials: () => void;
  onLoginMode: () => void;
  onLogout: () => void;
  onSignupMode: () => void;
  onSubmit: () => void;
  onToggleBetSlips?: () => void;
  onUploadLoginFile: () => void;
  password: string;
  session: SessionState | null;
  sessionLoading: boolean;
  betSlipCount?: number;
  betSlipsOpen?: boolean;
  balanceAlertTick?: number;
};

export function AccountCard({
  authBusy,
  authMode,
  loginId,
  onChangeLoginId,
  onChangePassword,
  onGenerateCredentials,
  onLoginMode,
  onLogout,
  onSignupMode,
  onSubmit,
  onToggleBetSlips,
  onUploadLoginFile,
  password,
  session,
  sessionLoading,
  betSlipCount = 0,
  betSlipsOpen = false,
  balanceAlertTick = 0,
}: AccountCardProps) {
  const isSignup = authMode === 'signup';
  const balanceShakeX = useRef(new Animated.Value(0)).current;
  const [balanceAlert, setBalanceAlert] = useState(false);

  useEffect(() => {
    if (balanceAlertTick <= 0) {
      return;
    }

    setBalanceAlert(true);
    Animated.sequence([
      Animated.timing(balanceShakeX, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(balanceShakeX, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(balanceShakeX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(balanceShakeX, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(balanceShakeX, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start(() => setBalanceAlert(false));
  }, [balanceAlertTick, balanceShakeX]);

  return (
    <View style={session ? styles.sessionStrip : styles.card}>
      {sessionLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#f97316" />
        </View>
      ) : session ? (
        <View style={styles.accountTopBar}>
          <View style={styles.accountSlimMeta}>
            <Text style={styles.accountTag}>@{session.user.loginId}</Text>
            <Text style={styles.accountDot}>•</Text>
            <Animated.View
              style={[styles.balanceBadge, balanceAlert ? styles.balanceBadgeAlert : null, { transform: [{ translateX: balanceShakeX }] }]}
            >
              <Text style={[styles.accountBalance, balanceAlert ? styles.accountBalanceAlert : null]}>
                Bal <AnimatedNumber value={session.user.balance} decimals={2} />
              </Text>
            </Animated.View>
          </View>
          <View style={styles.accountActions}>
            <Pressable style={[styles.topBarPill, betSlipsOpen ? styles.topBarPillActive : null]} onPress={onToggleBetSlips}>
              <Text style={styles.topBarPillText}>Slips {betSlipCount}</Text>
            </Pressable>
            <Pressable style={styles.inlineLogoutButton} onPress={onLogout}>
              <Text style={styles.inlineLogoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <TextInput
            autoCapitalize="none"
            value={loginId}
            onChangeText={onChangeLoginId}
            placeholder="login id"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={onChangePassword}
            placeholder="password"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
          <Pressable style={styles.primaryButton} disabled={authBusy} onPress={onSubmit}>
            <Text style={styles.primaryButtonText}>
              {authBusy ? 'Working...' : isSignup ? 'Create Account' : 'Login'}
            </Text>
          </Pressable>

          {isSignup ? (
            <>
              <Pressable onPress={onGenerateCredentials}>
                <Text style={styles.textLink}>Generate credentials for me</Text>
              </Pressable>
              <Pressable onPress={onLoginMode}>
                <Text style={styles.textLink}>Already have an account? Login</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable onPress={onUploadLoginFile}>
                <Text style={styles.textLink}>Use credential file</Text>
              </Pressable>
              <Pressable onPress={onSignupMode}>
                <Text style={styles.textLink}>Need an account? Create one</Text>
              </Pressable>
            </>
          )}
        </>
      )}
    </View>
  );
}

type BetSwiperProps = {
  bets: BetCard[];
  betAmount: string;
  cardHeight: number;
  currentIndex: number;
  celebratingBetId: string | null;
  onChangeBetAmount: (value: string) => void;
  onIndexChange: (index: number) => void;
  onPlaceBet: (bet: BetCard, choiceKey: BetChoiceKey) => void;
  submittingBetId: string | null;
};

const showHelpDialog = (title: string, message: string) => {
  if (Platform.OS === 'web' && typeof globalThis.alert === 'function') {
    globalThis.alert(title + '\n\n' + message);
    return;
  }

  Alert.alert(title, message);
};

export function BetSwiper({
  bets,
  betAmount,
  cardHeight,
  currentIndex,
  celebratingBetId,
  onChangeBetAmount,
  onIndexChange,
  onPlaceBet,
  submittingBetId,
}: BetSwiperProps) {
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: currentIndex * cardHeight, animated: true });
  }, [cardHeight, currentIndex, bets]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.swiper}
      contentContainerStyle={styles.swiperContent}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onMomentumScrollEnd={(event) => {
        const nextIndex = Math.round(event.nativeEvent.contentOffset.y / cardHeight);
        onIndexChange(Math.max(0, Math.min(nextIndex, bets.length - 1)));
      }}
    >
      {bets.map((bet, index) => {
        const amountValue = Number(betAmount);
        const stake = Number.isFinite(amountValue) && amountValue > 0 ? amountValue : 0;
        const backReturn = stake * bet.back.odds;
        const layReturn = stake * bet.lay.odds;
        const helpText = [
          bet.back.label,
          bet.back.meaning,
          bet.back.winText,
          '',
          bet.lay.label,
          bet.lay.meaning,
          bet.lay.winText,
        ].join(String.fromCharCode(10));
        const backBetId = bet.id + ':back';
        const layBetId = bet.id + ':lay';
        const backSubmitting = submittingBetId === backBetId;
        const laySubmitting = submittingBetId === layBetId;

        return (
          <View key={bet.id} style={[styles.betSlide, { minHeight: cardHeight }]}> 
            <View style={[styles.betSlideInner, styles.betSlideDual]}>
              <View style={styles.betHeroTop}>
                <Text style={styles.betHeroIndex}>{index + 1} / {bets.length}</Text>
                <Text style={styles.betHeroMarket}>{bet.market}</Text>
              </View>
              <View style={styles.betHeroBody}>
                <Text style={styles.betHeroMatch}>{bet.match}</Text>
                <Text style={styles.betHeroTitle}>{bet.outcomeLabel}</Text>
                <Text style={styles.betHeroHint}>Enter a stake, then tap Back or Lay below.</Text>
              </View>
              <View style={styles.betActionPanel}>
                <View style={styles.betActionHeader}>
                  <Text style={styles.betActionTitle}>Stake</Text>
                  <Pressable style={styles.helpButton} onPress={() => showHelpDialog(bet.outcomeLabel, helpText)}>
                    <Text style={styles.helpButtonText}>?</Text>
                  </Pressable>
                </View>
                <TextInput
                  keyboardType="numeric"
                  value={betAmount}
                  onChangeText={onChangeBetAmount}
                  placeholder="10"
                  placeholderTextColor="#94a3b8"
                  style={styles.betAmountInput}
                />
                <View style={styles.chipRow}>
                  {chipAmounts.map((amount) => (
                    <Pressable key={amount} style={styles.chip} onPress={() => onChangeBetAmount(String(amount))}>
                      <Text style={styles.chipText}>{amount}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.settlementNote}>Live prices come from the server market pool.</Text>
                <View style={styles.actionButtonRow}>
                  <Pressable
                    style={[styles.actionBetButton, styles.actionBetButtonBack]}
                    disabled={submittingBetId !== null}
                    onPress={() => onPlaceBet(bet, 'back')}
>
                    <ButtonBurst active={celebratingBetId === backBetId} />
                    <View style={styles.actionBetTopRow}>
                      <Text style={styles.actionBetSide}>BACK</Text>
                      <Text style={styles.actionBetOdds}>{bet.back.odds.toFixed(2)}x</Text>
                    </View>
                    <Text style={styles.actionBetLabel}>{bet.back.label}</Text>
                    <Text style={styles.actionBetMeta}>
                      Return {backReturn.toFixed(2)} • Profit {(backReturn - stake).toFixed(2)}
                    </Text>
                    <Text style={styles.actionBetCta}>{backSubmitting ? 'Placing...' : 'Bet Back'}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBetButton, styles.actionBetButtonLay]}
                    disabled={submittingBetId !== null}
                    onPress={() => onPlaceBet(bet, 'lay')}
>
                    <ButtonBurst active={celebratingBetId === layBetId} />
                    <View style={styles.actionBetTopRow}>
                      <Text style={styles.actionBetSide}>LAY</Text>
                      <Text style={styles.actionBetOdds}>{bet.lay.odds.toFixed(2)}x</Text>
                    </View>
                    <Text style={styles.actionBetLabel}>{bet.lay.label}</Text>
                    <Text style={styles.actionBetMeta}>
                      Return {layReturn.toFixed(2)} • Profit {(layReturn - stake).toFixed(2)}
                    </Text>
                    <Text style={styles.actionBetCta}>{laySubmitting ? 'Placing...' : 'Bet Lay'}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const burstVectors = [
  { x: -26, y: -18, color: '#f97316' },
  { x: 0, y: -28, color: '#fb7185' },
  { x: 24, y: -16, color: '#38bdf8' },
  { x: -22, y: 18, color: '#facc15' },
  { x: 0, y: 26, color: '#34d399' },
  { x: 24, y: 18, color: '#c084fc' },
];

function ButtonBurst({ active }: { active: boolean }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      progress.setValue(0);
      return;
    }

    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [active, progress]);

  if (!active) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.buttonBurst}>
      {burstVectors.map((particle, index) => (
        <Animated.View
          key={String(index)}
          style={[
            styles.buttonBurstParticle,
            {
              backgroundColor: particle.color,
              opacity: progress.interpolate({ inputRange: [0, 0.75, 1], outputRange: [0, 1, 0] }),
              transform: [
                { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, particle.x] }) },
                { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, particle.y] }) },
                { scale: progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.3, 1, 0.7] }) },
                { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', particle.x > 0 ? '28deg' : '-28deg'] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

type BetSlipsPanelProps = {
  slips: BetSlip[];
  markets: Market[];
  loading: boolean;
};

export function BetSlipsPanel({ slips, markets, loading }: BetSlipsPanelProps) {
  const findMarket = (marketSlug: string) => markets.find((market) => market.slug === marketSlug);

  return (
    <View style={styles.betSlipsPopover}>
      <View style={styles.betSlipsCard}>
        <View style={styles.betSlipsHeader}>
          <Text style={styles.betSlipsTitle}>Bet Slips</Text>
          <Text style={styles.betSlipsCount}>{slips.length}</Text>
        </View>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#f97316" />
          </View>
        ) : !slips.length ? (
          <Text style={styles.betSlipsEmpty}>Your placed bets will show here.</Text>
        ) : (
          <ScrollView style={styles.betSlipsList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {slips.map((slip) => {
              const market = findMarket(slip.marketSlug);
              const title = market ? (slip.side === 'yes' ? market.backLabel : market.layLabel) : slip.marketSlug;
              const returns = slip.amount * slip.odds;

              return (
                <View key={slip.id} style={styles.betSlipItem}>
                  <View style={styles.betSlipTopRow}>
                    <Text style={styles.betSlipTitle}>{title}</Text>
                    <Text style={styles.betSlipAmount}>{slip.amount.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.betSlipMeta}>
                    Odds {slip.odds.toFixed(2)}x • Return {returns.toFixed(2)}
                  </Text>
                  <Text style={styles.betSlipMeta}>{new Date(slip.createdAt).toLocaleString()}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

export function SwipeIndicator({ currentIndex, total }: { currentIndex: number; total: number }) {
  return <Text style={styles.swipeIndicator}>Outcome {currentIndex + 1} of {total}</Text>;
}

export function WarningCard({ errorText }: { errorText: string }) {
  return (
    <View style={styles.warningCard}>
      <Text style={styles.warningTitle}>Connection Issue</Text>
      <Text style={styles.warningText}>{errorText}</Text>
    </View>
  );
}

function AnimatedNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const delta = value - startValue;

    if (delta === 0) {
      setDisplayValue(value);
      return;
    }

    const startedAt = Date.now();
    const duration = 450;
    let animationFrame = 0;

    const updateValue = () => {
      const progress = Math.min((Date.now() - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const nextValue = startValue + delta * eased;
      setDisplayValue(nextValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateValue);
      }
    };

    animationFrame = requestAnimationFrame(updateValue);
    previousValueRef.current = value;

    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return <>{prefix + displayValue.toFixed(decimals) + suffix}</>;
}

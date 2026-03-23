import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { styles } from './appStyles';
import { chipAmounts, type AuthMode, type BetCard, type BetChoiceKey, type SessionState } from './appTypes';

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
  onUploadLoginFile: () => void;
  password: string;
  session: SessionState | null;
  sessionLoading: boolean;
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
  onUploadLoginFile,
  password,
  session,
  sessionLoading,
}: AccountCardProps) {
  const isSignup = authMode === 'signup';

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
            <Text style={styles.accountBalance}>
              Bal <AnimatedNumber value={session.user.balance} decimals={2} />
            </Text>
          </View>
          <Pressable style={styles.inlineLogoutButton} onPress={onLogout}>
            <Text style={styles.inlineLogoutText}>Logout</Text>
          </Pressable>
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
  onChangeBetAmount,
  onIndexChange,
  onPlaceBet,
  submittingBetId,
}: BetSwiperProps) {
  return (
    <ScrollView
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
        const backSubmitting = submittingBetId === bet.id + ':back';
        const laySubmitting = submittingBetId === bet.id + ':lay';

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

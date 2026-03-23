import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

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
          ? 'One outcome per screen. Switch between Back and Lay on the same card.'
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

export function BetSwiper({
  bets,
  betAmount,
  cardHeight,
  onChangeBetAmount,
  onIndexChange,
  onPlaceBet,
  submittingBetId,
}: BetSwiperProps) {
  const [selectedChoices, setSelectedChoices] = useState<Record<string, BetChoiceKey>>(() =>
    Object.fromEntries(bets.map((bet) => [bet.id, 'back'])) as Record<string, BetChoiceKey>
  );

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
        const choiceKey = selectedChoices[bet.id] ?? 'back';
        const choice = bet[choiceKey];
        const isBack = choiceKey === 'back';
        const isSubmitting = submittingBetId === bet.id + ':' + choiceKey;
        const amountValue = Number(betAmount);
        const stake = Number.isFinite(amountValue) && amountValue > 0 ? amountValue : 0;
        const estimatedReturn = stake * choice.odds;
        const estimatedProfit = estimatedReturn - stake;
        const helpText = choice.meaning + String.fromCharCode(10, 10) + choice.winText;

        return (
          <View key={bet.id} style={[styles.betSlide, { minHeight: cardHeight }]}> 
            <View style={[styles.betSlideInner, isBack ? styles.betSlideBack : styles.betSlideLay]}>
              <View style={styles.betHeroTop}>
                <Text style={styles.betHeroIndex}>{index + 1} / {bets.length}</Text>
                <Text style={styles.betHeroMarket}>{bet.market}</Text>
              </View>
              <View style={styles.betHeroBody}>
                <Text style={styles.betHeroMatch}>{bet.match}</Text>
                <Text style={styles.betHeroTitle}>{bet.outcomeLabel}</Text>
                <Text style={styles.betHeroLabel}>{choice.label}</Text>
                <Text style={styles.betHeroHint}>Choose Back or Lay below for this same outcome.</Text>
              </View>
              <View style={styles.betActionPanel}>
                <View style={styles.betActionHeader}>
                  <Text style={styles.betActionTitle}>Stake</Text>
                  <View style={styles.betActionHeaderRight}>
                    <Pressable
                      style={styles.helpButton}
                      onPress={() => Alert.alert(choice.label, helpText)}
                    >
                      <Text style={styles.helpButtonText}>?</Text>
                    </Pressable>
                    <View style={[styles.betSideBadge, isBack ? styles.betSideBack : styles.betSideLay]}>
                      <Text style={styles.betSideBadgeText}>{choice.direction.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.choiceRow}>
                  <Pressable
                    style={[styles.choiceButton, styles.choiceButtonBack, choiceKey === 'back' ? styles.choiceButtonActive : null]}
                    onPress={() => setSelectedChoices((current) => ({ ...current, [bet.id]: 'back' }))}
                  >
                    <Text style={styles.choiceButtonLabel}>Back</Text>
                    <Text style={styles.choiceButtonValue}>{bet.back.odds.toFixed(2)}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.choiceButton, styles.choiceButtonLay, choiceKey === 'lay' ? styles.choiceButtonActive : null]}
                    onPress={() => setSelectedChoices((current) => ({ ...current, [bet.id]: 'lay' }))}
                  >
                    <Text style={styles.choiceButtonLabel}>Lay</Text>
                    <Text style={styles.choiceButtonValue}>{bet.lay.odds.toFixed(2)}</Text>
                  </Pressable>
                </View>
                <View style={styles.returnGrid}>
                  <View style={styles.returnCard}>
                    <Text style={styles.returnLabel}>Price</Text>
                    <Text style={styles.returnValue}>{choice.odds.toFixed(2)}x</Text>
                  </View>
                  <View style={styles.returnCard}>
                    <Text style={styles.returnLabel}>Est. Return</Text>
                    <Text style={styles.returnValue}>{estimatedReturn.toFixed(2)}</Text>
                  </View>
                  <View style={styles.returnCard}>
                    <Text style={styles.returnLabel}>Est. Profit</Text>
                    <Text style={styles.returnValue}>{estimatedProfit.toFixed(2)}</Text>
                  </View>
                </View>
                <Text style={styles.settlementNote}>Returns shown here are based on the selected price for this exact outcome.</Text>
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
                <Pressable
                  style={[styles.placeBetButton, isBack ? styles.placeBetButtonBack : styles.placeBetButtonLay]}
                  disabled={submittingBetId !== null}
                  onPress={() => onPlaceBet(bet, choiceKey)}
                >
                  <Text style={styles.placeBetButtonText}>{isSubmitting ? 'Placing...' : choice.label}</Text>
                </Pressable>
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

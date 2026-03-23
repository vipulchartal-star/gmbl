import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { styles } from './appStyles';
import { chipAmounts, type AuthMode, type BetListItem, type SessionState } from './appTypes';

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
          ? 'One bet per screen. Swipe vertically to move through MI vs KKR markets.'
          : authMode === 'signup'
            ? 'Create your account with only login id and password.'
            : 'Enter your login id and password. After login you can swipe through bets and place one instantly.'}
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
          <View style={styles.accountTopMeta}>
            <Text style={styles.accountTag}>@{session.user.loginId}</Text>
            <Text style={styles.accountBalance}>
              Balance <AnimatedNumber value={session.user.balance} decimals={2} />
            </Text>
            <Text style={styles.accountStatus}>Swipe up or down to switch bets</Text>
          </View>
          <Pressable style={styles.inlineLogoutButton} onPress={onLogout}>
            <Text style={styles.inlineLogoutText}>Log Out</Text>
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
  bets: BetListItem[];
  betAmount: string;
  cardHeight: number;
  onChangeBetAmount: (value: string) => void;
  onIndexChange: (index: number) => void;
  onPlaceBet: (bet: BetListItem) => void;
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
        const isBack = bet.side === 'back';
        const isSubmitting = submittingBetId === bet.id;

        return (
          <View key={bet.id} style={[styles.betSlide, { minHeight: cardHeight }]}>
            <View style={[styles.betSlideInner, isBack ? styles.betSlideBack : styles.betSlideLay]}>
              <View style={styles.betHeroTop}>
                <Text style={styles.betHeroIndex}>{index + 1} / {bets.length}</Text>
                <Text style={styles.betHeroMarket}>{bet.market}</Text>
              </View>
              <View style={styles.betHeroBody}>
                <Text style={styles.betHeroMatch}>{bet.match}</Text>
                <Text style={styles.betHeroTitle}>{bet.side.toUpperCase()}</Text>
                <Text style={styles.betHeroLabel}>{bet.label}</Text>
                <Text style={styles.betHeroHint}>Swipe for the next bet. Place this one from the panel below.</Text>
              </View>
              <View style={styles.betActionPanel}>
                <View style={styles.betActionHeader}>
                  <Text style={styles.betActionTitle}>Stake</Text>
                  <View style={[styles.betSideBadge, isBack ? styles.betSideBack : styles.betSideLay]}>
                    <Text style={styles.betSideBadgeText}>{bet.side.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.betMeaningBox}>
                  <Text style={styles.betMeaningTitle}>{isBack ? 'Back means you bet for it to happen.' : 'Lay means you bet against it happening.'}</Text>
                  <Text style={styles.betMeaningText}>{isBack ? 'If this outcome happens, your back bet is the winning side.' : 'If this outcome does not happen, your lay bet is the winning side.'}</Text>
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
                <Pressable
                  style={[styles.placeBetButton, isBack ? styles.placeBetButtonBack : styles.placeBetButtonLay]}
                  disabled={submittingBetId !== null}
                  onPress={() => onPlaceBet(bet)}
                >
                  <Text style={styles.placeBetButtonText}>{isSubmitting ? 'Placing...' : 'Bet ' + bet.side.toUpperCase()}</Text>
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
  return <Text style={styles.swipeIndicator}>Bet {currentIndex + 1} of {total}</Text>;
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

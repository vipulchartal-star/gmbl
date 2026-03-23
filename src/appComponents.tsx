import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { styles } from './appStyles';
import { type AuthMode, type BetListItem, type SessionState } from './appTypes';

type HeaderProps = {
  authMode: AuthMode;
  session: SessionState | null;
};

export function ScreenHeader({ authMode, session }: HeaderProps) {
  return (
    <>
      <Text style={styles.eyebrow}>{session ? 'Bet List' : 'Login'}</Text>
      <Text style={styles.title}>{session ? 'GMBL' : authMode === 'signup' ? 'Create Account' : 'Welcome Back'}</Text>
      <Text style={styles.subtitle}>
        {session
          ? 'View every MI vs KKR market entry in one list.'
          : authMode === 'signup'
            ? 'Create your account with only login id and password.'
            : 'Enter your login id and password. The betting list appears after login.'}
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
            <Text style={styles.accountStatus}>MI vs KKR markets loaded</Text>
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

type BetListCardProps = {
  bets: BetListItem[];
};

export function BetListCard({ bets }: BetListCardProps) {
  return (
    <View style={styles.cardCompact}>
      <Text style={styles.sectionLabel}>All Bets</Text>
      <View style={styles.betList}>
        {bets.map((bet) => {
          const isBack = bet.side === 'back';

          return (
            <View key={bet.id} style={styles.betListItem}>
              <View style={styles.betListCopy}>
                <Text style={styles.betListTitle}>{bet.label}</Text>
                <Text style={styles.betListMeta}>{bet.match} • {bet.market}</Text>
              </View>
              <View style={[styles.betSideBadge, isBack ? styles.betSideBack : styles.betSideLay]}>
                <Text style={styles.betSideBadgeText}>{bet.side.toUpperCase()}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
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

  return <>{`${prefix}${displayValue.toFixed(decimals)}${suffix}`}</>;
}

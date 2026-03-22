import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { styles } from './appStyles';
import { chipAmounts, type AuthMode, type Market, type SessionState } from './appTypes';

type HeaderProps = {
  authMode: AuthMode;
  session: SessionState | null;
};

export function ScreenHeader({ authMode, session }: HeaderProps) {
  return (
    <>
      <Text style={styles.eyebrow}>{session ? 'Live Bets' : 'Login'}</Text>
      <Text style={styles.title}>{session ? 'GMBL' : authMode === 'signup' ? 'Create Account' : 'Welcome Back'}</Text>
      <Text style={styles.subtitle}>
        {session
          ? 'Track the market and place bets below.'
          : authMode === 'signup'
            ? 'Create your account with only login id and password.'
            : 'Enter your login id and password. The betting market appears after login.'}
      </Text>
    </>
  );
}

type AccountCardProps = {
  authBusy: boolean;
  authMode: AuthMode;
  loginId: string;
  marketStatus: string;
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
  marketStatus,
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
            <Text style={styles.accountStatus}>Market {marketStatus}</Text>
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

type MarketCardProps = {
  liveRatio: string;
  market: Market;
  marketLoading: boolean;
  noShare: number;
  totalPool: number;
  yesShare: number;
};

export function MarketCard({ liveRatio, market, marketLoading, noShare, totalPool, yesShare }: MarketCardProps) {
  return (
    <View style={styles.cardCompact}>
      <Text style={styles.sectionLabel}>Live Market</Text>
      <Text style={styles.question}>{market.question}</Text>
      {marketLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <>
          <View style={styles.ratioRow}>
            <RatioPanel label="YES" value={market.yesPool} percent={yesShare} accent="#22c55e" />
            <RatioPanel label="NO" value={market.noPool} percent={noShare} accent="#ef4444" />
          </View>
          <View style={styles.statsRow}>
            <Stat label="Pool" value={totalPool} decimals={2} />
            <Stat label="Bets" value={market.totalBets} decimals={0} />
            <Stat label="Ratio" textValue={liveRatio} />
          </View>
        </>
      )}
    </View>
  );
}

type BetCardProps = {
  betAmount: string;
  onChangeBetAmount: (value: string) => void;
  onPlaceNo: () => void;
  onPlaceYes: () => void;
  submitting: 'yes' | 'no' | null;
};

export function BetCard({ betAmount, onChangeBetAmount, onPlaceNo, onPlaceYes, submitting }: BetCardProps) {
  return (
    <View style={styles.cardCompact}>
      <Text style={styles.sectionLabel}>Bet Amount</Text>
      <TextInput
        keyboardType="numeric"
        value={betAmount}
        onChangeText={onChangeBetAmount}
        placeholder="10"
        placeholderTextColor="#6b7280"
        style={styles.inputCompact}
      />
      <View style={styles.chipRow}>
        {chipAmounts.map((amount) => (
          <Pressable key={amount} style={styles.chip} onPress={() => onChangeBetAmount(String(amount))}>
            <Text style={styles.chipText}>{amount}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.betRow}>
        <BetButton
          label={submitting === 'yes' ? 'Placing...' : 'Bet YES'}
          accent="#22c55e"
          disabled={submitting !== null}
          onPress={onPlaceYes}
        />
        <BetButton
          label={submitting === 'no' ? 'Placing...' : 'Bet NO'}
          accent="#ef4444"
          disabled={submitting !== null}
          onPress={onPlaceNo}
        />
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

function RatioPanel({
  accent,
  label,
  percent,
  value,
}: {
  accent: string;
  label: string;
  percent: number;
  value: number;
}) {
  return (
    <View style={styles.ratioPanel}>
      <Text style={[styles.ratioLabel, { color: accent }]}>{label}</Text>
      <Text style={styles.ratioValue}><AnimatedNumber value={percent * 100} decimals={1} suffix="%" /></Text>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { backgroundColor: accent, width: `${percent * 100}%` }]} />
      </View>
      <Text style={styles.poolText}>Pool <AnimatedNumber value={value} decimals={2} /></Text>
    </View>
  );
}

function Stat({
  label,
  value,
  decimals = 0,
  textValue,
}: {
  label: string;
  value?: number;
  decimals?: number;
  textValue?: string;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{textValue ?? <AnimatedNumber value={value ?? 0} decimals={decimals} />}</Text>
    </View>
  );
}

function BetButton({
  accent,
  disabled,
  label,
  onPress,
}: {
  accent: string;
  disabled: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.betButton,
        {
          backgroundColor: accent,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={styles.betButtonText}>{label}</Text>
    </Pressable>
  );
}

function AnimatedNumber({
  decimals = 0,
  prefix = '',
  suffix = '',
  value,
}: {
  decimals?: number;
  prefix?: string;
  suffix?: string;
  value: number;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    const startedAt = Date.now();
    const durationMs = 420;
    let frameId = 0;

    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const nextValue = startValue + (endValue - startValue) * eased;

      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        previousValueRef.current = endValue;
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return <>{`${prefix}${displayValue.toFixed(decimals)}${suffix}`}</>;
}

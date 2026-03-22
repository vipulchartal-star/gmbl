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
      <Text style={styles.eyebrow}>{session ? 'Realtime Betting' : 'Login'}</Text>
      <Text style={styles.title}>{session ? 'GMBL' : authMode === 'signup' ? 'Create Account' : 'Welcome Back'}</Text>
      <Text style={styles.subtitle}>
        {session
          ? 'Place bets after you sign in.'
          : authMode === 'signup'
            ? 'Create your account first, then the market will appear after login.'
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
  onChangeUsername: (value: string) => void;
  onGenerateCredentials: () => void;
  onLoginMode: () => void;
  onLogout: () => void;
  onSignupMode: () => void;
  onSubmit: () => void;
  onUploadLoginFile: () => void;
  password: string;
  session: SessionState | null;
  sessionLoading: boolean;
  username: string;
};

export function AccountCard({
  authBusy,
  authMode,
  loginId,
  marketStatus,
  onChangeLoginId,
  onChangePassword,
  onChangeUsername,
  onGenerateCredentials,
  onLoginMode,
  onLogout,
  onSignupMode,
  onSubmit,
  onUploadLoginFile,
  password,
  session,
  sessionLoading,
  username,
}: AccountCardProps) {
  const isSignup = authMode === 'signup';

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>{session ? 'Account' : isSignup ? 'Create Account' : 'Login'}</Text>
      {sessionLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#f97316" />
        </View>
      ) : session ? (
        <>
          <View style={styles.accountRow}>
            <Text style={styles.accountName}>{session.user.username}</Text>
            <Text style={styles.accountMeta}>@{session.user.loginId}</Text>
          </View>
          <View style={styles.statsRow}>
            <Stat label="Balance" value={session.user.balance.toFixed(2)} />
            <Stat label="Market" value={marketStatus} />
          </View>
          <Pressable style={styles.secondaryButton} onPress={onLogout}>
            <Text style={styles.secondaryButtonText}>Log Out</Text>
          </Pressable>
        </>
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
          {isSignup ? (
            <TextInput
              value={username}
              onChangeText={onChangeUsername}
              placeholder="username"
              placeholderTextColor="#6b7280"
              style={styles.input}
            />
          ) : null}
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
    <View style={styles.card}>
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
            <Stat label="Pool" value={totalPool.toFixed(2)} />
            <Stat label="Bets" value={`${market.totalBets}`} />
            <Stat label="Ratio" value={liveRatio} />
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
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>Bet Amount</Text>
      <TextInput
        keyboardType="numeric"
        value={betAmount}
        onChangeText={onChangeBetAmount}
        placeholder="10"
        placeholderTextColor="#6b7280"
        style={styles.input}
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
      <Text style={styles.ratioValue}>{(percent * 100).toFixed(1)}%</Text>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { backgroundColor: accent, width: `${percent * 100}%` }]} />
      </View>
      <Text style={styles.poolText}>Pool {value.toFixed(2)}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
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

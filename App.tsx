import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { apiConfig, ApiError, apiRequest } from './src/api';

type BetSide = 'yes' | 'no';
type AuthMode = 'login' | 'signup';

type Market = {
  slug: string;
  question: string;
  status: string;
  yesPool: number;
  noPool: number;
  totalPool: number;
  totalBets: number;
  updatedAt: string;
};

const parseCredentialText = (content: string) => {
  const entries = Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex === -1) {
          return ['', ''];
        }

        return [line.slice(0, separatorIndex).trim(), line.slice(separatorIndex + 1).trim()];
      })
      .filter(([key, value]) => key && value),
  ) as Record<string, string>;

  return {
    loginId: entries.login_id ?? '',
    username: entries.username ?? '',
    password: entries.password ?? '',
  };
};

const readCredentialFile = () =>
  new Promise<string>((resolve, reject) => {
    if (Platform.OS !== 'web' || typeof document === 'undefined' || typeof FileReader === 'undefined') {
      reject(new Error('File upload is only available on web.'));
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,text/plain';
    input.onchange = () => {
      const file = input.files?.[0];

      if (!file) {
        reject(new Error('No file selected.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    };

    input.click();
  });

type SessionUser = {
  id: string;
  loginId: string;
  username: string;
  balance: number;
};

type SessionState = {
  token: string;
  user: SessionUser;
};

type AuthResponse = {
  token: string;
  user: SessionUser;
};

type MarketResponse = {
  market: Market;
};

type MeResponse = {
  user: SessionUser;
};

type BetResponse = {
  balance: number;
  market: Market;
};

const chipAmounts = [10, 25, 50, 100];
const sessionKey = 'gmbl-api-session';
const pollMs = 4000;

const emptyMarket: Market = {
  slug: 'live-yes-no',
  question: 'Will the outcome be YES?',
  status: 'open',
  yesPool: 0,
  noPool: 0,
  totalPool: 0,
  totalBets: 0,
  updatedAt: '',
};

const createGeneratedCredentials = () => {
  const loginSuffix = Math.random().toString(36).slice(2, 8);
  const passwordSuffix = Math.random().toString(36).slice(2, 12);

  return {
    loginId: `player-${loginSuffix}`,
    username: `Player ${loginSuffix.slice(0, 4)}`,
    password: `gmbl-${passwordSuffix}`,
  };
};

const downloadTextFile = (filename: string, content: string) => {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || typeof URL === 'undefined') {
    return false;
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);

  return true;
};

export default function App() {
  const [market, setMarket] = useState<Market>(emptyMarket);
  const [betAmount, setBetAmount] = useState('10');
  const [marketLoading, setMarketLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [submitting, setSubmitting] = useState<BetSide | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [loginId, setLoginId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<SessionState | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const totalPool = market.totalPool || market.yesPool + market.noPool;
  const yesShare = totalPool > 0 ? market.yesPool / totalPool : 0.5;
  const noShare = totalPool > 0 ? market.noPool / totalPool : 0.5;

  const liveRatio = useMemo(
    () => `${(yesShare * 100).toFixed(0)} : ${(noShare * 100).toFixed(0)}`,
    [noShare, yesShare],
  );

  const persistSession = async (nextSession: SessionState | null) => {
    if (nextSession) {
      await SecureStore.setItemAsync(sessionKey, JSON.stringify(nextSession));
      setSession(nextSession);
      return;
    }

    await SecureStore.deleteItemAsync(sessionKey);
    setSession(null);
  };

  const loadMarket = async () => {
    try {
      const response = await apiRequest<MarketResponse>('/market');
      setMarket(response.market);
      setErrorText(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load market.';
      setErrorText(message);
    } finally {
      setMarketLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const rawSession = await SecureStore.getItemAsync(sessionKey);

        if (!rawSession) {
          return;
        }

        const parsed = JSON.parse(rawSession) as SessionState;
        const response = await apiRequest<MeResponse>('/me', { token: parsed.token });

        if (isMounted) {
          setSession({ token: parsed.token, user: response.user });
        }
      } catch {
        await SecureStore.deleteItemAsync(sessionKey);
      } finally {
        if (isMounted) {
          setSessionLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    loadMarket();
    const intervalId = setInterval(loadMarket, pollMs);
    return () => clearInterval(intervalId);
  }, []);

  const clearAuthForm = () => {
    setPassword('');
    setUsername('');
  };

  const submitAuth = async () => {
    if (authBusy) {
      return;
    }

    try {
      setAuthBusy(true);
      const path = authMode === 'signup' ? '/auth/signup' : '/auth/login';
      const response = await apiRequest<AuthResponse>(path, {
        method: 'POST',
        body:
          authMode === 'signup'
            ? { loginId, username, password }
            : { loginId, password },
      });

      await persistSession({ token: response.token, user: response.user });
      clearAuthForm();
      setErrorText(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed.';
      Alert.alert(authMode === 'signup' ? 'Signup failed' : 'Login failed', message);
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    await persistSession(null);
  };


  const generateSignupCredentials = () => {
    const generated = createGeneratedCredentials();
    const credentialText = [
      'GMBL login credentials',
      '',
      `login_id: ${generated.loginId}`,
      `username: ${generated.username}`,
      `password: ${generated.password}`,
      '',
      `api_url: ${apiConfig.baseUrl}`,
    ].join('\n');
    const downloaded = downloadTextFile(`${generated.loginId}.txt`, credentialText);

    setAuthMode('signup');
    setLoginId(generated.loginId);
    setUsername(generated.username);
    setPassword(generated.password);

    Alert.alert(
      'Credentials generated',
      downloaded
        ? 'Signup fields were filled and a text file was downloaded.'
        : 'Signup fields were filled. Save these credentials before creating the account.',
    );
  };

  const uploadLoginFile = async () => {
    try {
      const content = await readCredentialFile();
      const parsed = parseCredentialText(content);

      if (!parsed.loginId || !parsed.password) {
        throw new Error('The file is missing login_id or password.');
      }

      setAuthMode('login');
      setLoginId(parsed.loginId);
      setUsername(parsed.username);
      setPassword(parsed.password);

      Alert.alert('Credentials loaded', 'Login details were loaded from the file.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load credentials.';

      if (message === 'No file selected.') {
        return;
      }

      Alert.alert('Upload failed', message);
    }
  };
  const placeBet = async (side: BetSide) => {
    if (!session) {
      Alert.alert('Login required', 'Create an account or log in before placing a bet.');
      return;
    }

    const amount = Number(betAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid bet', 'Enter a positive number before placing a bet.');
      return;
    }

    try {
      setSubmitting(side);
      const response = await apiRequest<BetResponse>('/bets', {
        method: 'POST',
        token: session.token,
        body: { side, amount },
      });

      setMarket(response.market);
      setSession({
        token: session.token,
        user: {
          ...session.user,
          balance: response.balance,
        },
      });
      setErrorText(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bet placement failed.';

      if (error instanceof ApiError && error.status === 401) {
        await persistSession(null);
      }

      Alert.alert('Bet failed', message);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.eyebrow}>Realtime Betting</Text>
        <Text style={styles.title}>GMBL</Text>
        <Text style={styles.subtitle}>Node + Postgres backed betting client.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>API Endpoint</Text>
          <Text style={styles.accountHint}>{apiConfig.baseUrl}</Text>
          <Text style={styles.accountHint}>
            For Android emulator use `10.0.2.2`. Change `src/api.ts` for a real server URL.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Account</Text>
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
                <Stat label="Market" value={market.status} />
              </View>
              <Pressable style={styles.secondaryButton} onPress={logout}>
                <Text style={styles.secondaryButtonText}>Log Out</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.toggleRow}>
                <AuthToggle active={authMode === 'signup'} label="Create" onPress={() => setAuthMode('signup')} />
                <AuthToggle active={authMode === 'login'} label="Login" onPress={() => setAuthMode('login')} />
              </View>
              <TextInput
                autoCapitalize="none"
                value={loginId}
                onChangeText={setLoginId}
                placeholder="login id"
                placeholderTextColor="#6b7280"
                style={styles.input}
              />
              {authMode === 'signup' ? (
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="anonymous username"
                  placeholderTextColor="#6b7280"
                  style={styles.input}
                />
              ) : null}
              <TextInput
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholder="password"
                placeholderTextColor="#6b7280"
                style={styles.input}
              />
              <Pressable style={styles.primaryButton} disabled={authBusy} onPress={submitAuth}>
                <Text style={styles.primaryButtonText}>
                  {authBusy ? 'Working...' : authMode === 'signup' ? 'Create Account' : 'Login'}
                </Text>
              </Pressable>
              <Pressable style={styles.secondaryGhostButton} disabled={authBusy} onPress={generateSignupCredentials}>
                <Text style={styles.secondaryGhostButtonText}>Generate Login</Text>
              </Pressable>
              <Text style={styles.accountHint}>
                Generates signup credentials and downloads a text file on web.
              </Text>
              <Pressable style={styles.secondaryGhostButton} disabled={authBusy} onPress={uploadLoginFile}>
                <Text style={styles.secondaryGhostButtonText}>Upload Login File</Text>
              </Pressable>
              <Text style={styles.accountHint}>
                Use the downloaded credential file to refill login details instantly on web.
              </Text>
            </>
          )}
        </View>

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

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Bet Amount</Text>
          <TextInput
            keyboardType="numeric"
            value={betAmount}
            onChangeText={setBetAmount}
            placeholder="10"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
          <View style={styles.chipRow}>
            {chipAmounts.map((amount) => (
              <Pressable key={amount} style={styles.chip} onPress={() => setBetAmount(String(amount))}>
                <Text style={styles.chipText}>{amount}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.betRow}>
            <BetButton
              label={submitting === 'yes' ? 'Placing...' : 'Bet YES'}
              accent="#22c55e"
              disabled={submitting !== null || !session}
              onPress={() => placeBet('yes')}
            />
            <BetButton
              label={submitting === 'no' ? 'Placing...' : 'Bet NO'}
              accent="#ef4444"
              disabled={submitting !== null || !session}
              onPress={() => placeBet('no')}
            />
          </View>
          {!session ? <Text style={styles.accountHint}>Sign in before placing a bet.</Text> : null}
        </View>

        {errorText ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Connection Issue</Text>
            <Text style={styles.warningText}>{errorText}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
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

function AuthToggle({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.toggleButton, active ? styles.toggleButtonActive : null]}>
      <Text style={[styles.toggleText, active ? styles.toggleTextActive : null]}>{label}</Text>
    </Pressable>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#08111f',
  },
  screen: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    gap: 18,
  },
  eyebrow: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 40,
    fontWeight: '800',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  sectionLabel: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#111827',
    borderColor: '#334155',
    borderRadius: 16,
    borderWidth: 1,
    color: '#f8fafc',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#f97316',
    borderRadius: 14,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff7ed',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#eff6ff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryGhostButton: {
    alignItems: 'center',
    borderColor: '#334155',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
  },
  secondaryGhostButtonText: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '700',
  },
  question: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  ratioRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ratioPanel: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  ratioLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ratioValue: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
  },
  meterTrack: {
    backgroundColor: '#1e293b',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  meterFill: {
    borderRadius: 999,
    height: '100%',
  },
  poolText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: '#1e293b',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '700',
  },
  betRow: {
    flexDirection: 'row',
    gap: 12,
  },
  betButton: {
    alignItems: 'center',
    borderRadius: 18,
    flex: 1,
    paddingVertical: 16,
  },
  betButtonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
  },
  warningCard: {
    backgroundColor: '#3f1d16',
    borderColor: '#fb923c',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  warningTitle: {
    color: '#ffedd5',
    fontSize: 16,
    fontWeight: '800',
  },
  warningText: {
    color: '#fed7aa',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    borderColor: '#334155',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
  },
  toggleButtonActive: {
    backgroundColor: '#1e293b',
    borderColor: '#f97316',
  },
  toggleText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  toggleTextActive: {
    color: '#f8fafc',
  },
  accountRow: {
    gap: 4,
  },
  accountName: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
  },
  accountMeta: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '700',
  },
  accountHint: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
});

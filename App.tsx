import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView } from 'react-native';

import { AccountCard, BetCard, MarketCard, ScreenHeader, WarningCard } from './src/appComponents';
import { styles } from './src/appStyles';
import {
  emptyMarket,
  pollMs,
  sessionKey,
  type AuthMode,
  type AuthResponse,
  type BetResponse,
  type BetSide,
  type Market,
  type MarketResponse,
  type MeResponse,
  type SessionState,
} from './src/appTypes';
import { createGeneratedCredentials, downloadTextFile, parseCredentialText, readCredentialFile } from './src/credentials';
import { apiConfig, ApiError, apiRequest } from './src/api';

const sessionStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }

    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};

export default function App() {
  const [market, setMarket] = useState<Market>(emptyMarket);
  const [betAmount, setBetAmount] = useState('10');
  const [marketLoading, setMarketLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [submitting, setSubmitting] = useState<BetSide | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<SessionState | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [authDebugText, setAuthDebugText] = useState<string | null>(null);

  const totalPool = market.totalPool || market.yesPool + market.noPool;
  const yesShare = totalPool > 0 ? market.yesPool / totalPool : 0.5;
  const noShare = totalPool > 0 ? market.noPool / totalPool : 0.5;

  const liveRatio = useMemo(
    () => `${(yesShare * 100).toFixed(0)} : ${(noShare * 100).toFixed(0)}`,
    [noShare, yesShare],
  );

  const persistSession = async (nextSession: SessionState | null) => {
    setSession(nextSession);

    if (nextSession) {
      await sessionStorage.setItem(sessionKey, JSON.stringify(nextSession));
      return;
    }

    await sessionStorage.removeItem(sessionKey);
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
        const rawSession = await sessionStorage.getItem(sessionKey);

        if (!rawSession) {
          return;
        }

        const parsed = JSON.parse(rawSession) as SessionState;
        const response = await apiRequest<MeResponse>('/me', { token: parsed.token });

        if (isMounted) {
          setSession({ token: parsed.token, user: response.user });
        }
      } catch {
        await sessionStorage.removeItem(sessionKey);
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
  };

  const submitAuth = async () => {
    if (authBusy) {
      return;
    }

    try {
      setAuthBusy(true);
      setAuthDebugText(null);
      const path = authMode === 'signup' ? '/auth/signup' : '/auth/login';
      console.log('[auth] submit', { mode: authMode, path, loginId, baseUrl: apiConfig.baseUrl });
      const response = await apiRequest<AuthResponse>(path, {
        method: 'POST',
        body:
          authMode === 'signup'
            ? { loginId, password }
            : { loginId, password },
      });

      console.log('[auth] success', { mode: authMode, loginId: response.user.loginId, userId: response.user.id });
      await persistSession({ token: response.token, user: response.user });
      clearAuthForm();
      setErrorText(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed.';
      const debugMessage =
        error instanceof ApiError
          ? `mode=${authMode} status=${error.status} path=${error.details?.path ?? 'unknown'} baseUrl=${error.details?.baseUrl ?? apiConfig.baseUrl} message=${message}`
          : `mode=${authMode} baseUrl=${apiConfig.baseUrl} message=${message}`;
      console.log('[auth] failure', debugMessage);
      setAuthDebugText(debugMessage);
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
      `password: ${generated.password}`,
      '',
      `api_url: ${apiConfig.baseUrl}`,
    ].join('\n');
    const downloaded = downloadTextFile(`${generated.loginId}.txt`, credentialText);

    setAuthMode('signup');
    setLoginId(generated.loginId);
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

      const nextSession = {
        token: session.token,
        user: {
          ...session.user,
          balance: response.balance,
        },
      };

      setSession(nextSession);
      setMarket(response.market);
      await sessionStorage.setItem(sessionKey, JSON.stringify(nextSession));
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
        {session ? null : <ScreenHeader authMode={authMode} session={session} />}
        <AccountCard
          authBusy={authBusy}
          authMode={authMode}
          loginId={loginId}
          marketStatus={market.status}
          onChangeLoginId={setLoginId}
          onChangePassword={setPassword}
          onGenerateCredentials={generateSignupCredentials}
          onLoginMode={() => setAuthMode('login')}
          onLogout={logout}
          onSignupMode={() => setAuthMode('signup')}
          onSubmit={submitAuth}
          onUploadLoginFile={uploadLoginFile}
          password={password}
          session={session}
          sessionLoading={sessionLoading}
        />
        {session ? (
          <>
            <MarketCard
              liveRatio={liveRatio}
              market={market}
              marketLoading={marketLoading}
              noShare={noShare}
              totalPool={totalPool}
              yesShare={yesShare}
            />
            <BetCard
              betAmount={betAmount}
              onChangeBetAmount={setBetAmount}
              onPlaceNo={() => placeBet('no')}
              onPlaceYes={() => placeBet('yes')}
              submitting={submitting}
            />
          </>
        ) : null}
        {authDebugText ? <WarningCard errorText={authDebugText} /> : null}
        {errorText ? <WarningCard errorText={errorText} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

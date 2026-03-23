import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { AccountCard, BetSlipsPanel, BetSwiper, ScreenHeader, SwipeIndicator, WarningCard } from './src/appComponents';
import { styles } from './src/appStyles';
import {
  buildBetCards,
  sessionKey,
  type AuthMode,
  type AuthResponse,
  type BetCard,
  type BetChoiceKey,
  type BetResponse,
  type BetSlip,
  type MarketsResponse,
  type MeResponse,
  type Market,
  type MyBetsResponse,
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
  const { height } = useWindowDimensions();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [marketsLoading, setMarketsLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [betSlipsLoading, setBetSlipsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [betAmount, setBetAmount] = useState('10');
  const [submittingBetId, setSubmittingBetId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [session, setSession] = useState<SessionState | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [betSlips, setBetSlips] = useState<BetSlip[]>([]);
  const [betSlipsOpen, setBetSlipsOpen] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [authDebugText, setAuthDebugText] = useState<string | null>(null);

  const cardHeight = Math.max(420, height - 126);
  const betCards = useMemo(() => buildBetCards(markets), [markets]);

  const persistSession = async (nextSession: SessionState | null) => {
    setSession(nextSession);

    if (nextSession) {
      await sessionStorage.setItem(sessionKey, JSON.stringify(nextSession));
      return;
    }

    await sessionStorage.removeItem(sessionKey);
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
    let isMounted = true;

    const loadMarkets = async () => {
      try {
        const response = await apiRequest<MarketsResponse>('/markets');
        if (isMounted) {
          setMarkets(response.markets);
          setErrorText(null);
        }
      } catch (error) {
        if (isMounted) {
          setErrorText(error instanceof Error ? error.message : 'Failed to load markets.');
        }
      } finally {
        if (isMounted) {
          setMarketsLoading(false);
        }
      }
    };

    loadMarkets();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (currentIndex > 0 && currentIndex >= betCards.length) {
      setCurrentIndex(Math.max(0, betCards.length - 1));
    }
  }, [betCards.length, currentIndex]);

  useEffect(() => {
    let isMounted = true;

    const loadBetSlips = async () => {
      if (!session) {
        if (isMounted) {
          setBetSlips([]);
          setBetSlipsLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setBetSlipsLoading(true);
        }

        const response = await apiRequest<MyBetsResponse>('/bets/me', { token: session.token });

        if (isMounted) {
          setBetSlips(response.bets);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await persistSession(null);
          return;
        }

        if (isMounted) {
          setErrorText(error instanceof Error ? error.message : 'Failed to load your bet slips.');
        }
      } finally {
        if (isMounted) {
          setBetSlipsLoading(false);
        }
      }
    };

    loadBetSlips();

    return () => {
      isMounted = false;
    };
  }, [session]);

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
      const response = await apiRequest<AuthResponse>(path, {
        method: 'POST',
        body: { loginId, password },
      });

      await persistSession({ token: response.token, user: response.user });
      clearAuthForm();
      setErrorText(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed.';
      const debugMessage =
        error instanceof ApiError
          ? 'mode=' + authMode + ' status=' + error.status + ' path=' + (error.details?.path ?? 'unknown') + ' baseUrl=' + (error.details?.baseUrl ?? apiConfig.baseUrl) + ' message=' + message
          : 'mode=' + authMode + ' baseUrl=' + apiConfig.baseUrl + ' message=' + message;
      setAuthDebugText(debugMessage);
      Alert.alert(authMode === 'signup' ? 'Signup failed' : 'Login failed', message);
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    setBetSlipsOpen(false);
    await persistSession(null);
  };

  const generateSignupCredentials = () => {
    const generated = createGeneratedCredentials();
    const credentialText = [
      'GMBL login credentials',
      '',
      'login_id: ' + generated.loginId,
      'password: ' + generated.password,
      '',
      'api_url: ' + apiConfig.baseUrl,
    ].join('\n');
    const downloaded = downloadTextFile(generated.loginId + '.txt', credentialText);

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

  const placeBet = async (bet: BetCard, choiceKey: BetChoiceKey) => {
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
      const choice = bet[choiceKey];
      setSubmittingBetId(bet.id + ':' + choiceKey);
      const response = await apiRequest<BetResponse>('/bets', {
        method: 'POST',
        token: session.token,
        body: {
          marketSlug: bet.marketSlug,
          side: choice.apiSide,
          amount,
        },
      });

      const nextSession = {
        token: session.token,
        user: {
          ...session.user,
          balance: response.balance,
        },
      };

      setSession(nextSession);
      setMarkets((currentMarkets) => {
        const updatedMarkets = currentMarkets.map((market) => (market.slug === response.market.slug ? response.market : market));
        const betMarketIndex = updatedMarkets.findIndex((market) => market.slug === response.market.slug);

        if (betMarketIndex === -1) {
          return updatedMarkets;
        }

        const nextMarkets = updatedMarkets.slice();
        const [betMarket] = nextMarkets.splice(betMarketIndex, 1);
        nextMarkets.push(betMarket);
        return nextMarkets;
      });
      setCurrentIndex((index) => (index >= betCards.length - 1 ? 0 : index));
      setBetSlips((currentSlips) => [response.bet, ...currentSlips].slice(0, 50));
      await sessionStorage.setItem(sessionKey, JSON.stringify(nextSession));
      setErrorText(null);
      Alert.alert('Bet placed', bet[choiceKey].label + ' for ' + amount.toFixed(2));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bet placement failed.';

      if (error instanceof ApiError && error.status === 401) {
        await persistSession(null);
      }

      Alert.alert('Bet failed', message);
    } finally {
      setSubmittingBetId(null);
    }
  };

  if (session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.feedScreen}>
          <View style={styles.feedHeader}>
            <AccountCard
              authBusy={authBusy}
              authMode={authMode}
              loginId={loginId}
              onChangeLoginId={setLoginId}
              onChangePassword={setPassword}
              onGenerateCredentials={generateSignupCredentials}
              onLoginMode={() => setAuthMode('login')}
              onLogout={logout}
              onSignupMode={() => setAuthMode('signup')}
              onSubmit={submitAuth}
              onToggleBetSlips={() => setBetSlipsOpen((open) => !open)}
              onUploadLoginFile={uploadLoginFile}
              password={password}
              session={session}
              sessionLoading={sessionLoading}
              betSlipCount={betSlips.length}
              betSlipsOpen={betSlipsOpen}
            />
            <SwipeIndicator currentIndex={currentIndex} total={betCards.length} />
          </View>
          {betSlipsOpen ? <BetSlipsPanel slips={betSlips} markets={markets} loading={betSlipsLoading} /> : null}
          {marketsLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color="#f97316" />
            </View>
          ) : betCards.length ? (
            <BetSwiper
              bets={betCards}
              betAmount={betAmount}
              cardHeight={cardHeight}
              currentIndex={currentIndex}
              onChangeBetAmount={setBetAmount}
              onIndexChange={setCurrentIndex}
              onPlaceBet={placeBet}
              submittingBetId={submittingBetId}
            />
          ) : (
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>No Markets</Text>
              <Text style={styles.warningText}>No betting markets are available from the server.</Text>
            </View>
          )}
          {authDebugText ? <WarningCard errorText={authDebugText} /> : null}
          {errorText ? <WarningCard errorText={errorText} /> : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        endFillColor="#08111f"
        alwaysBounceVertical={false}
      >
        <ScreenHeader authMode={authMode} session={session} />
        <AccountCard
          authBusy={authBusy}
          authMode={authMode}
          loginId={loginId}
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
        {authDebugText ? <WarningCard errorText={authDebugText} /> : null}
        {errorText ? <WarningCard errorText={errorText} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

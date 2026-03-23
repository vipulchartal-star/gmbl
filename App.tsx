import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState, useEffect } from 'react';
import { Alert, ImageBackground, Platform, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { AccountCard, BetListCard, ScreenHeader, WarningCard } from './src/appComponents';
import { styles } from './src/appStyles';
import {
  betList,
  sessionKey,
  type AuthMode,
  type AuthResponse,
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
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<SessionState | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [authDebugText, setAuthDebugText] = useState<string | null>(null);

  const marketCount = useMemo(() => new Set(betList.map((bet) => bet.market)).size, []);

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
          setErrorText(null);
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
          ? `mode=${authMode} status=${error.status} path=${error.details?.path ?? 'unknown'} baseUrl=${error.details?.baseUrl ?? apiConfig.baseUrl} message=${message}`
          : `mode=${authMode} baseUrl=${apiConfig.baseUrl} message=${message}`;
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

  const betContent = (
    <>
      {session ? (
        <ImageBackground source={require('./assets/green.jpg')} style={styles.posterHero} imageStyle={styles.posterHeroImage}>
          <View style={styles.posterHeroShade}>
            <Text style={styles.posterEyebrow}>Match Poster</Text>
            <Text style={styles.posterTitle}>MI vs KKR</Text>
            <View style={styles.posterMetaRow}>
              <View style={styles.posterPill}>
                <Text style={styles.posterPillLabel}>Markets</Text>
                <Text style={styles.posterPillValue}>{marketCount}</Text>
              </View>
              <View style={styles.posterPill}>
                <Text style={styles.posterPillLabel}>Bets</Text>
                <Text style={styles.posterPillValue}>{betList.length}</Text>
              </View>
              <View style={styles.posterPill}>
                <Text style={styles.posterPillLabel}>Types</Text>
                <Text style={styles.posterPillValue}>Back / Lay</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      ) : null}
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
      {session ? <BetListCard bets={betList} /> : null}
      {authDebugText ? <WarningCard errorText={authDebugText} /> : null}
      {errorText ? <WarningCard errorText={errorText} /> : null}
    </>
  );

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
        {betContent}
      </ScrollView>
    </SafeAreaView>
  );
}

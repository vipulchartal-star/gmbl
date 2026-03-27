import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const tokenKey = 'gmbl-session-token';

export const readSessionToken = async () => {
  if (Platform.OS === 'web') {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(tokenKey);
  }

  return SecureStore.getItemAsync(tokenKey);
};

export const writeSessionToken = async (token: string) => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(tokenKey, token);
    }
    return;
  }

  await SecureStore.setItemAsync(tokenKey, token);
};

export const clearSessionToken = async () => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(tokenKey);
    }
    return;
  }

  await SecureStore.deleteItemAsync(tokenKey);
};

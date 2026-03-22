import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCXWUWd2KRXpPKEvDSQdsY_5lRmiXkF_lg',
  authDomain: 'shopscan-6c0f9.firebaseapp.com',
  projectId: 'shopscan-6c0f9',
  storageBucket: 'shopscan-6c0f9.firebasestorage.app',
  messagingSenderId: '788527510137',
  appId: '1:788527510137:web:6583b4a58314e61227daa8',
  measurementId: 'G-J5EYLRMS1C',
};

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

export const hasFirebaseConfig = () => true;

export const getFirebaseApp = () => {
  if (appInstance) {
    return appInstance;
  }

  appInstance = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return appInstance;
};

export const getDb = () => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
};

export const marketDocPath = ['markets', 'live-yes-no'] as const;

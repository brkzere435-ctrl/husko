import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';

import { ensureFirebaseApp } from '@/services/firebaseRemote';
import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';

export type HuskoAuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

let authRef: Auth | null = null;

function mapUser(user: User): HuskoAuthUser {
  return {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
  };
}

function ensureAuth(): Auth | null {
  if (authRef) return authRef;
  const app = ensureFirebaseApp();
  if (!app) return null;
  authRef = getAuth(app);
  return authRef;
}

export function isGoogleAuthConfigured(): boolean {
  const e = readHuskoExpoExtra();
  return (
    e.googleAuthWebClientId.trim().length > 0 &&
    (e.googleAuthAndroidClientId.trim().length > 0 || e.googleAuthIosClientId.trim().length > 0)
  );
}

export function subscribeGoogleAuthUser(onUser: (user: HuskoAuthUser | null) => void): () => void {
  const auth = ensureAuth();
  if (!auth) {
    onUser(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => {
    onUser(user ? mapUser(user) : null);
  });
}

export async function signInWithGoogleToken(idToken: string, accessToken?: string): Promise<HuskoAuthUser> {
  const auth = ensureAuth();
  if (!auth) throw new Error('AUTH_UNAVAILABLE');
  const token = idToken.trim();
  if (!token) throw new Error('GOOGLE_TOKEN_MISSING');
  const credential = GoogleAuthProvider.credential(token, accessToken ?? null);
  const result = await signInWithCredential(auth, credential);
  return mapUser(result.user);
}

export async function signOutGoogleAuth(): Promise<void> {
  const auth = ensureAuth();
  if (!auth) return;
  await signOut(auth);
}

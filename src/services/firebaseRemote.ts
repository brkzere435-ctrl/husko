import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore';

import type { LatLng, Order } from '@/stores/useHuskoStore';
import { coerceOrderFromRemote } from '@/utils/orderNormalize';
import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';

export type RemoteAutonomousDemo = { enabled: boolean; stepMs: number };

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let driverWriteTimer: ReturnType<typeof setTimeout> | null = null;

function buildConfig() {
  const e = readHuskoExpoExtra();
  const projectId = e.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = e.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  if (!projectId || !apiKey) return null;
  return {
    apiKey,
    authDomain: e.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: e.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    messagingSenderId:
      e.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: e.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  };
}

function ensureDb(): Firestore | null {
  const cfg = buildConfig();
  if (!cfg) return null;
  if (!getApps().length) {
    app = initializeApp(cfg);
  } else {
    app = getApp();
  }
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}

/** True si la liaison cloud (Firestore) est configurée. */
export function isRemoteSyncEnabled(): boolean {
  return buildConfig() !== null;
}

export async function remotePushOrder(order: Order): Promise<void> {
  const firestore = ensureDb();
  if (!firestore) return;
  const payload = JSON.parse(JSON.stringify(order)) as Record<string, unknown>;
  await setDoc(doc(firestore, 'orders', order.id), payload);
}

/** Synchronise le mode auto + rythme pour l’ETA côté client (même projet Firebase). */
export async function remotePushAutonomousDemoMeta(cfg: RemoteAutonomousDemo): Promise<void> {
  const firestore = ensureDb();
  if (!firestore) return;
  await setDoc(
    doc(firestore, 'meta', 'autonomousDemo'),
    { enabled: cfg.enabled, stepMs: cfg.stepMs, updatedAt: Date.now() },
    { merge: true }
  );
}

export function subscribeToRemoteAutonomousDemo(
  onCfg: (cfg: RemoteAutonomousDemo | null) => void
): () => void {
  const firestore = ensureDb();
  if (!firestore) return () => {};

  return onSnapshot(
    doc(firestore, 'meta', 'autonomousDemo'),
    (snap) => {
      const d = snap.data();
      if (!d) {
        onCfg(null);
        return;
      }
      const enabled = d.enabled === true;
      const stepMs =
        typeof d.stepMs === 'number' && Number.isFinite(d.stepMs) && d.stepMs >= 3000
          ? Math.min(d.stepMs, 600_000)
          : 30_000;
      onCfg({ enabled, stepMs });
    },
    (err) => {
      if (__DEV__) console.warn('[Husko Firestore autonomousDemo]', err.message);
    }
  );
}


function remotePushDriverNow(pos: LatLng | null, heading: number): Promise<void> {
  const firestore = ensureDb();
  if (!firestore) return Promise.resolve();
  const payload = {
    lat: pos?.latitude ?? null,
    lng: pos?.longitude ?? null,
    heading,
    updatedAt: Date.now(),
  };
  return setDoc(doc(firestore, 'meta', 'driver'), payload, { merge: true });
}

/** Évite trop d’écritures Firestore pendant le suivi GPS. */
export function remotePushDriverDebounced(pos: LatLng | null, heading: number): void {
  if (!isRemoteSyncEnabled()) return;
  if (driverWriteTimer) clearTimeout(driverWriteTimer);
  driverWriteTimer = setTimeout(() => {
    driverWriteTimer = null;
    void remotePushDriverNow(pos, heading);
  }, 1800);
}

export function subscribeToRemoteOrders(onOrders: (orders: Order[]) => void): () => void {
  const firestore = ensureDb();
  if (!firestore) return () => {};

  return onSnapshot(
    collection(firestore, 'orders'),
    (snap) => {
      const list: Order[] = [];
      snap.forEach((d) => {
        const raw = d.data();
        const order = coerceOrderFromRemote(raw);
        if (order) list.push(order);
      });
      list.sort((a, b) => b.createdAt - a.createdAt);
      onOrders(list);
    },
    (err) => {
      if (__DEV__) console.warn('[Husko Firestore orders]', err.message);
    }
  );
}

export function subscribeToRemoteDriver(
  onDriver: (driver: LatLng | null, heading: number) => void
): () => void {
  const firestore = ensureDb();
  if (!firestore) return () => {};

  return onSnapshot(
    doc(firestore, 'meta', 'driver'),
    (snap) => {
      const d = snap.data();
      if (!d || d.lat == null || d.lng == null) {
        onDriver(null, 0);
        return;
      }
      onDriver(
        { latitude: Number(d.lat), longitude: Number(d.lng) },
        typeof d.heading === 'number' ? d.heading : 0
      );
    },
    (err) => {
      if (__DEV__) console.warn('[Husko Firestore driver]', err.message);
    }
  );
}

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
import { debugAgentLog } from '@/utils/debugAgentLog';
import { postRuntimeDebugIngest } from '@/utils/debugIngestRuntime';
import { coerceOrderFromRemote } from '@/utils/orderNormalize';
import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';

/** Métadonnées snapshot Firestore `orders` (diagnostic synchro). */
export type OrdersRemoteSnapshotMeta = {
  snapDocCount: number;
  coercedCount: number;
};

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

/** Debug : identifiant projet Firebase (public, non secret). */
export function debugFirebaseProjectId(): string | null {
  const c = buildConfig();
  return c?.projectId ?? null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const REMOTE_PUSH_MAX_ATTEMPTS = 3;
const REMOTE_PUSH_BACKOFF_MS = [0, 500, 1400];

export async function remotePushOrder(order: Order): Promise<void> {
  const firestore = ensureDb();
  const pid = debugFirebaseProjectId();
  debugAgentLog({
    location: 'firebaseRemote.ts:remotePushOrder:entry',
    message: 'remotePushOrder entry',
    hypothesisId: 'H1',
    data: { orderId: order.id, hasDb: !!firestore, projectId: pid },
  });
  if (!firestore) return;
  const payload = JSON.parse(JSON.stringify(order)) as Record<string, unknown>;
  let lastErr: unknown;
  for (let attempt = 0; attempt < REMOTE_PUSH_MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await sleep(REMOTE_PUSH_BACKOFF_MS[attempt] ?? 1000);
      debugAgentLog({
        location: 'firebaseRemote.ts:remotePushOrder:retry',
        message: 'setDoc retry',
        hypothesisId: 'H1',
        data: { orderId: order.id, attempt: attempt + 1 },
      });
    }
    try {
      await setDoc(doc(firestore, 'orders', order.id), payload);
      debugAgentLog({
        location: 'firebaseRemote.ts:remotePushOrder:success',
        message: 'setDoc orders ok',
        hypothesisId: 'H1',
        data: { orderId: order.id, projectId: pid, attempts: attempt + 1 },
      });
      return;
    } catch (e) {
      lastErr = e;
      debugAgentLog({
        location: 'firebaseRemote.ts:remotePushOrder:catch',
        message: 'setDoc failed',
        hypothesisId: 'H1',
        data: { orderId: order.id, err: e instanceof Error ? e.message : String(e), attempt: attempt + 1 },
      });
    }
  }
  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
  throw new Error(`Écriture commande cloud : ${msg}`);
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

/** État « service ouvert / fermé » pour les commandes client (gérant → Firestore `meta/service`). */
export type RemoteServiceSettings = {
  acceptingOrders: boolean;
  updatedAt: number;
};

export async function remotePushServiceSettings(acceptingOrders: boolean): Promise<void> {
  const firestore = ensureDb();
  if (!firestore) return;
  await setDoc(
    doc(firestore, 'meta', 'service'),
    { acceptingOrders, updatedAt: Date.now() },
    { merge: true }
  );
}

export function subscribeToRemoteServiceSettings(
  onSettings: (settings: RemoteServiceSettings | null) => void
): () => void {
  const firestore = ensureDb();
  if (!firestore) return () => {};

  return onSnapshot(
    doc(firestore, 'meta', 'service'),
    (snap) => {
      const d = snap.data();
      if (!d || typeof d.acceptingOrders !== 'boolean') {
        onSettings(null);
        return;
      }
      onSettings({
        acceptingOrders: d.acceptingOrders,
        updatedAt: typeof d.updatedAt === 'number' ? d.updatedAt : Date.now(),
      });
    },
    (err) => {
      if (__DEV__) console.warn('[Husko Firestore service]', err.message);
    }
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

export function subscribeToRemoteOrders(
  onOrders: (orders: Order[], meta: OrdersRemoteSnapshotMeta) => void,
  onListenError?: (err: Error) => void
): () => void {
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
      const pid = debugFirebaseProjectId();
      const meta: OrdersRemoteSnapshotMeta = {
        snapDocCount: snap.size,
        coercedCount: list.length,
      };
      debugAgentLog({
        location: 'firebaseRemote.ts:subscribeToRemoteOrders:snapshot',
        message: 'orders snapshot',
        hypothesisId: 'H2',
        data: {
          projectId: pid,
          snapDocCount: meta.snapDocCount,
          coercedCount: meta.coercedCount,
          sampleIds: list.slice(0, 8).map((o) => o.id),
        },
      });
      // #region agent log
      postRuntimeDebugIngest({
        runId: 'run1',
        hypothesisId: 'H2',
        location: 'firebaseRemote.ts:subscribeToRemoteOrders:snapshot',
        message: 'orders snapshot',
        data: {
          projectId: pid,
          snapDocCount: meta.snapDocCount,
          coercedCount: meta.coercedCount,
          sampleIds: list.slice(0, 8).map((o) => o.id),
        },
      });
      // #endregion
      onOrders(list, meta);
    },
    (err) => {
      if (__DEV__) console.warn('[Husko Firestore orders]', err.message);
      debugAgentLog({
        location: 'firebaseRemote.ts:subscribeToRemoteOrders:onError',
        message: 'orders listener error',
        hypothesisId: 'H2',
        data: {
          projectId: debugFirebaseProjectId(),
          err: err instanceof Error ? err.message : String(err),
        },
      });
      // #region agent log
      postRuntimeDebugIngest({
        runId: 'run1',
        hypothesisId: 'H2',
        location: 'firebaseRemote.ts:subscribeToRemoteOrders:onError',
        message: 'orders listener error',
        data: {
          projectId: debugFirebaseProjectId(),
          err: err instanceof Error ? err.message : String(err),
        },
      });
      // #endregion
      const wrapped =
        err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Erreur Firestore');
      onListenError?.(wrapped);
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
        // #region agent log
        postRuntimeDebugIngest({
          runId: 'run1',
          hypothesisId: 'H3',
          location: 'firebaseRemote.ts:subscribeToRemoteDriver:snapshot',
          message: 'driver snapshot empty',
          data: { projectId: debugFirebaseProjectId(), hasData: !!d },
        });
        // #endregion
        onDriver(null, 0);
        return;
      }
      // #region agent log
      postRuntimeDebugIngest({
        runId: 'run1',
        hypothesisId: 'H3',
        location: 'firebaseRemote.ts:subscribeToRemoteDriver:snapshot',
        message: 'driver snapshot position',
        data: {
          projectId: debugFirebaseProjectId(),
          lat: Number(d.lat),
          lng: Number(d.lng),
          heading: typeof d.heading === 'number' ? d.heading : 0,
        },
      });
      // #endregion
      onDriver(
        { latitude: Number(d.lat), longitude: Number(d.lng) },
        typeof d.heading === 'number' ? d.heading : 0
      );
    },
    (err) => {
      if (__DEV__) console.warn('[Husko Firestore driver]', err.message);
      // #region agent log
      postRuntimeDebugIngest({
        runId: 'run1',
        hypothesisId: 'H3',
        location: 'firebaseRemote.ts:subscribeToRemoteDriver:onError',
        message: 'driver listener error',
        data: {
          projectId: debugFirebaseProjectId(),
          err: err instanceof Error ? err.message : String(err),
        },
      });
      // #endregion
    }
  );
}

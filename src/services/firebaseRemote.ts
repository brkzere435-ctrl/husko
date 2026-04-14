import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore';
import { Platform } from 'react-native';

import type { LatLng, Order } from '@/stores/useHuskoStore';
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
const DRIVER_PUSH_DEBOUNCE_MS = 600;
const DRIVER_PUSH_IMMEDIATE_GAP_MS = 4_000;
/** Au-delà de ce délai sans écriture Firestore, le client masque le livreur (évite fantômes). */
const DRIVER_STALE_MS = 10 * 60_000;
const DRIVER_ORDER_DOC_PREFIX = 'driver_order_';
const ORDER_TRACKING_COLLECTION = 'tracking';
const ORDER_TRACKING_DRIVER_DOC = 'driverLive';
let lastDriverPushAt = 0;
let lastDriverPushOrderId: string | null = null;

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
    try {
      // Android/iOS RN: WebChannel peut décrocher sur certains réseaux (transport errored).
      // Long-polling stabilise les listeners Firestore pour le suivi GPS cross-app.
      db =
        Platform.OS === 'web'
          ? getFirestore(app)
          : initializeFirestore(app, {
              experimentalForceLongPolling: true,
            });
    } catch {
      db = getFirestore(app);
    }
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
  if (!firestore) return;
  const payload = JSON.parse(JSON.stringify(order)) as Record<string, unknown>;
  let lastErr: unknown;
  for (let attempt = 0; attempt < REMOTE_PUSH_MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await sleep(REMOTE_PUSH_BACKOFF_MS[attempt] ?? 1000);
    }
    try {
      await setDoc(doc(firestore, 'orders', order.id), payload);
      return;
    } catch (e) {
      lastErr = e;
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


function remotePushDriverNow(pos: LatLng | null, heading: number, orderId: string | null): Promise<void> {
  const firestore = ensureDb();
  if (!firestore) return Promise.resolve();
  const normalizedOrderId = orderId && orderId.trim().length > 0 ? orderId.trim() : null;
  const payload: Record<string, unknown> = {
    lat: pos?.latitude ?? null,
    lng: pos?.longitude ?? null,
    heading,
    updatedAt: Date.now(),
  };
  if (normalizedOrderId != null) {
    payload.orderId = normalizedOrderId;
  } else if (pos == null) {
    // Passage hors-ligne: on efface explicitement l'association commande.
    payload.orderId = null;
  }
  if (normalizedOrderId == null) {
    return setDoc(doc(firestore, 'meta', 'driver'), payload, { merge: true });
  }
  return Promise.all([
    setDoc(doc(firestore, 'meta', 'driver'), payload, { merge: true }),
    setDoc(doc(firestore, 'meta', `${DRIVER_ORDER_DOC_PREFIX}${normalizedOrderId}`), payload, { merge: true }),
    setDoc(
      doc(firestore, 'orders', normalizedOrderId, ORDER_TRACKING_COLLECTION, ORDER_TRACKING_DRIVER_DOC),
      payload,
      { merge: true }
    ),
  ]).then(() => undefined);
}

/** Évite trop d’écritures Firestore pendant le suivi GPS. */
export function remotePushDriverDebounced(pos: LatLng | null, heading: number, orderId: string | null): void {
  if (!isRemoteSyncEnabled()) return;
  const normalizedOrderId = orderId && orderId.trim().length > 0 ? orderId.trim() : null;
  if (pos == null) {
    if (driverWriteTimer) {
      clearTimeout(driverWriteTimer);
      driverWriteTimer = null;
    }
    lastDriverPushAt = Date.now();
    lastDriverPushOrderId = null;
    void remotePushDriverNow(null, 0, normalizedOrderId);
    return;
  }
  const now = Date.now();
  const shouldPushNow =
    now - lastDriverPushAt > DRIVER_PUSH_IMMEDIATE_GAP_MS || lastDriverPushOrderId !== normalizedOrderId;
  if (shouldPushNow) {
    if (driverWriteTimer) {
      clearTimeout(driverWriteTimer);
      driverWriteTimer = null;
    }
    lastDriverPushAt = now;
    lastDriverPushOrderId = normalizedOrderId;
    void remotePushDriverNow(pos, heading, normalizedOrderId);
    return;
  }
  if (driverWriteTimer) clearTimeout(driverWriteTimer);
  driverWriteTimer = setTimeout(() => {
    driverWriteTimer = null;
    lastDriverPushAt = Date.now();
    lastDriverPushOrderId = normalizedOrderId;
    void remotePushDriverNow(pos, heading, normalizedOrderId);
  }, DRIVER_PUSH_DEBOUNCE_MS);
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
      const meta: OrdersRemoteSnapshotMeta = {
        snapDocCount: snap.size,
        coercedCount: list.length,
      };
      onOrders(list, meta);
    },
    (err) => {
      if (__DEV__) console.warn('[Husko Firestore orders]', err.message);
      const wrapped =
        err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Erreur Firestore');
      onListenError?.(wrapped);
    }
  );
}

type DriverSnapshot = {
  driver: LatLng;
  heading: number;
  updatedAt: number | null;
  orderId: string | null;
};

function parseDriverSnapshot(raw: unknown): DriverSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;
  const lat = Number(d.lat);
  const lng = Number(d.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  // Certains snapshots historiques/intermédiaires arrivent en 0,0:
  // on les ignore pour éviter de "débrancher" le suivi client.
  if ((lat === 0 && lng === 0) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  const heading = typeof d.heading === 'number' && Number.isFinite(d.heading) ? d.heading : 0;
  const updatedAt = typeof d.updatedAt === 'number' ? d.updatedAt : null;
  const orderId = typeof d.orderId === 'string' && d.orderId.trim().length > 0 ? d.orderId.trim() : null;
  return { driver: { latitude: lat, longitude: lng }, heading, updatedAt, orderId };
}

function isDriverSnapshotStale(s: DriverSnapshot): boolean {
  return s.updatedAt != null && Date.now() - s.updatedAt > DRIVER_STALE_MS;
}

export function subscribeToRemoteDriver(
  orderId: string | null,
  onDriver: (driver: LatLng | null, heading: number, updatedAt: number | null) => void
): () => void {
  const firestore = ensureDb();
  if (!firestore) return () => {};
  const normalizedOrderId = orderId && orderId.trim().length > 0 ? orderId.trim() : null;
  const orderDocName = normalizedOrderId ? `${DRIVER_ORDER_DOC_PREFIX}${normalizedOrderId}` : null;
  let orderTrackingSnapshot: DriverSnapshot | null = null;
  let orderSnapshot: DriverSnapshot | null = null;
  let globalSnapshot: DriverSnapshot | null = null;

  const emitBest = () => {
    const candidates = [orderTrackingSnapshot, orderSnapshot, globalSnapshot].filter(
      (s): s is DriverSnapshot => s !== null && !isDriverSnapshotStale(s)
    );
    if (candidates.length === 0) {
      onDriver(null, 0, null);
      return;
    }
    // Priorité: snapshot qui matche la commande suivie, sinon le plus frais.
    if (normalizedOrderId) {
      const matching = candidates.find((s) => s.orderId === normalizedOrderId);
      if (matching) {
        onDriver(matching.driver, matching.heading, matching.updatedAt);
        return;
      }
      const unknownOrder = candidates.find((s) => s.orderId == null);
      if (unknownOrder) {
        // Tolérance: certains snapshots valides n'embarquent pas orderId.
        // On garde le point frais tant qu'aucune autre commande explicite ne correspond.
        onDriver(unknownOrder.driver, unknownOrder.heading, unknownOrder.updatedAt);
        return;
      }
      // Empêche un "suivi irréel" en affichant la position d'une autre commande.
      onDriver(null, 0, null);
      return;
    }
    const freshest = candidates.reduce((best, cur) => {
      const bestTs = best.updatedAt ?? 0;
      const curTs = cur.updatedAt ?? 0;
      return curTs >= bestTs ? cur : best;
    });
    onDriver(freshest.driver, freshest.heading, freshest.updatedAt);
  };

  const unsubGlobal = onSnapshot(
    doc(firestore, 'meta', 'driver'),
    (snap) => {
      globalSnapshot = parseDriverSnapshot(snap.data());
      emitBest();
    },
    (err) => {
      if (__DEV__) console.warn('[Husko Firestore driver/global]', err.message);
      // Garde le dernier snapshot valide pour éviter une disparition immédiate
      // du livreur sur une erreur réseau transitoire du listener Firestore.
      emitBest();
    }
  );

  const trackedOrderId = normalizedOrderId;
  if (!orderDocName || !trackedOrderId) {
    return () => {
      unsubGlobal();
    };
  }

  const unsubOrderTracking = onSnapshot(
    doc(firestore, 'orders', trackedOrderId, ORDER_TRACKING_COLLECTION, ORDER_TRACKING_DRIVER_DOC),
    (snap) => {
      orderTrackingSnapshot = parseDriverSnapshot(snap.data());
      emitBest();
    },
    (err) => {
      if (__DEV__) console.warn('[Husko Firestore driver/orderTracking]', err.message);
      emitBest();
    }
  );

  const unsubOrder = onSnapshot(
    doc(firestore, 'meta', orderDocName),
    (snap) => {
      orderSnapshot = parseDriverSnapshot(snap.data());
      emitBest();
    },
    (err) => {
      if (__DEV__) console.warn('[Husko Firestore driver/order]', err.message);
      emitBest();
    }
  );

  return () => {
    unsubOrderTracking();
    unsubOrder();
    unsubGlobal();
  };
}

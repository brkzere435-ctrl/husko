import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { MenuItem } from '@/constants/menu';
import {
  AUTONOMOUS_PACE_PRESETS,
  nextFlowStatus,
  type AutonomousPacePresetId,
} from '@/constants/autonomousDelivery';
import { DEFAULT_ROLE_PIN } from '@/constants/devicePin';
import {
  isRemoteSyncEnabled,
  remotePushAutonomousDemoMeta,
  remotePushDriverDebounced,
  remotePushOrder,
  type RemoteAutonomousDemo,
} from '@/services/firebaseRemote';
import { normalizeOrderStatus } from '@/utils/orderNormalize';
import {
  notifyClientDelivered,
  notifyClientOnTheWay,
  notifyClientPreparing,
  notifyGerantDelivered,
  notifyGerantNewOrder,
  notifyLivreurPickupReady,
} from '@/services/orderNotifications';

export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'awaiting_livreur'
  | 'on_way'
  | 'delivered'
  | 'cancelled';

export type OrderLine = { item: MenuItem; qty: number };

export type Order = {
  id: string;
  createdAt: number;
  status: OrderStatus;
  lines: OrderLine[];
  total: number;
  addressLabel: string;
  destLat: number;
  destLng: number;
};

export type LatLng = { latitude: number; longitude: number };

export type OrderActor = 'gerant' | 'livreur';

type State = {
  cart: OrderLine[];
  orders: Order[];
  driver: LatLng | null;
  driverHeading: number;
  livreurOnline: boolean;
  managerPin: string;
  /** False jusqu’à ce que le gérant ait défini un code personnel (1ʳᵉ connexion). */
  gerantPinOnboarded: boolean;
  livreurPin: string;
  livreurPinOnboarded: boolean;
  notificationsEnabled: boolean;
  /** Mode démo : avance seul les commandes jusqu’à livrée (app gérant ouverte). */
  autonomousDemoEnabled: boolean;
  autonomousPacePreset: AutonomousPacePresetId;
  /** Copie distante (Firestore meta) pour l’ETA côté client ; non persisté localement. */
  remoteAutonomousDemo: RemoteAutonomousDemo | null;
  addToCart: (item: MenuItem, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  placeOrder: (addressLabel: string, dest: LatLng) => Order | null;
  /** Transitions autorisées uniquement (gérant / livreur). */
  transitionOrder: (orderId: string, next: OrderStatus, actor: OrderActor) => boolean;
  /** Une étape du flux, sans contrôle d’acteur (mode autonome). */
  demoAdvanceNextOrder: () => void;
  setDriver: (pos: LatLng | null, heading?: number) => void;
  setLivreurOnline: (v: boolean) => void;
  setManagerPin: (pin: string) => void;
  completeGerantPinSetup: (newPin: string) => void;
  completeLivreurPinSetup: (newPin: string) => void;
  setNotificationsEnabled: (v: boolean) => void;
  setAutonomousDemoEnabled: (v: boolean) => void;
  setAutonomousPacePreset: (id: AutonomousPacePresetId) => void;
};

const ANGERS_DEFAULT: LatLng = { latitude: 47.4739, longitude: -0.5517 };

const STORAGE_VERSION = 5;

function genId() {
  return `HK-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  actor: OrderActor
): boolean {
  if (from === 'pending' && to === 'preparing' && actor === 'gerant') return true;
  if (from === 'preparing' && to === 'awaiting_livreur' && actor === 'gerant') return true;
  if (from === 'awaiting_livreur' && to === 'on_way' && actor === 'livreur') return true;
  if (from === 'on_way' && to === 'delivered' && actor === 'livreur') return true;
  return false;
}

async function fireTransitionNotifications(
  prev: OrderStatus,
  next: OrderStatus,
  order: Order,
  notificationsEnabled: boolean
) {
  if (!notificationsEnabled) return;
  try {
    if (prev === 'pending' && next === 'preparing') {
      await notifyClientPreparing(order.id);
    } else if (prev === 'preparing' && next === 'awaiting_livreur') {
      await notifyLivreurPickupReady(order.id);
    } else if (prev === 'awaiting_livreur' && next === 'on_way') {
      await notifyClientOnTheWay(order.id);
    } else if (prev === 'on_way' && next === 'delivered') {
      await notifyGerantDelivered(order);
      await notifyClientDelivered(order.id);
    }
  } catch {
    /* ignore notification errors */
  }
}

export const useHuskoStore = create<State>()(
  persist(
    (set, get) => {
      const applyOrderTransition = (orderId: string, next: OrderStatus): boolean => {
        const { orders, notificationsEnabled } = get();
        const order = orders.find((o) => o.id === orderId);
        if (!order) return false;
        const prev = order.status;
        if (prev === next) return false;
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: next } : o)),
        }));
        const updated = { ...order, status: next };
        void remotePushOrder(updated);
        void fireTransitionNotifications(prev, next, updated, notificationsEnabled);
        return true;
      };

      return {
      cart: [],
      orders: [],
      driver: null,
      driverHeading: 0,
      livreurOnline: false,
      managerPin: DEFAULT_ROLE_PIN,
      gerantPinOnboarded: false,
      livreurPin: DEFAULT_ROLE_PIN,
      livreurPinOnboarded: false,
      notificationsEnabled: true,
      autonomousDemoEnabled: false,
      autonomousPacePreset: 'demo',
      remoteAutonomousDemo: null,

      addToCart: (item, qty = 1) => {
        set((s) => {
          const lines = [...s.cart];
          const i = lines.findIndex((l) => l.item.id === item.id);
          if (i >= 0) lines[i] = { ...lines[i], qty: lines[i].qty + qty };
          else lines.push({ item, qty });
          return { cart: lines };
        });
      },

      removeFromCart: (itemId) => {
        set((s) => ({ cart: s.cart.filter((l) => l.item.id !== itemId) }));
      },

      clearCart: () => set({ cart: [] }),

      placeOrder: (addressLabel, dest) => {
        const { cart, notificationsEnabled } = get();
        if (!cart.length) return null;
        const total = cart.reduce((a, l) => a + l.item.price * l.qty, 0);
        const order: Order = {
          id: genId(),
          createdAt: Date.now(),
          status: 'pending',
          lines: [...cart],
          total,
          addressLabel,
          destLat: dest.latitude,
          destLng: dest.longitude,
        };
        set((s) => ({ orders: [order, ...s.orders], cart: [] }));
        void remotePushOrder(order);
        if (notificationsEnabled) {
          notifyGerantNewOrder(order).catch(() => {});
        }
        return order;
      },

      transitionOrder: (orderId, next, actor) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return false;
        if (!canTransition(order.status, next, actor)) return false;
        return applyOrderTransition(orderId, next);
      },

      demoAdvanceNextOrder: () => {
        if (!get().autonomousDemoEnabled) return;
        const orders = get().orders;
        const active = orders
          .filter((o) => o.status !== 'delivered' && o.status !== 'cancelled')
          .sort((a, b) => a.createdAt - b.createdAt)[0];
        if (!active) return;
        const next = nextFlowStatus(active.status);
        if (!next) return;
        applyOrderTransition(active.id, next);
      },

      setDriver: (pos, heading = 0) => {
        set({ driver: pos, driverHeading: heading });
        remotePushDriverDebounced(pos, heading);
      },

      setLivreurOnline: (livreurOnline) => set({ livreurOnline }),
      setManagerPin: (managerPin) => set({ managerPin, gerantPinOnboarded: true }),
      completeGerantPinSetup: (newPin) => set({ managerPin: newPin, gerantPinOnboarded: true }),
      completeLivreurPinSetup: (newPin) => set({ livreurPin: newPin, livreurPinOnboarded: true }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),

      setAutonomousDemoEnabled: (autonomousDemoEnabled) => {
        set({ autonomousDemoEnabled });
        const s = get();
        if (isRemoteSyncEnabled()) {
          const stepMs = AUTONOMOUS_PACE_PRESETS[s.autonomousPacePreset].stepMs;
          void remotePushAutonomousDemoMeta({ enabled: autonomousDemoEnabled, stepMs });
        }
      },

      setAutonomousPacePreset: (autonomousPacePreset) => {
        set({ autonomousPacePreset });
        const s = get();
        if (!isRemoteSyncEnabled() || !s.autonomousDemoEnabled) return;
        void remotePushAutonomousDemoMeta({
          enabled: true,
          stepMs: AUTONOMOUS_PACE_PRESETS[autonomousPacePreset].stepMs,
        });
      },
    };
    },
    {
      name: 'husko-storage',
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, version) => {
        const p = persisted as {
          orders?: Order[];
          managerPin?: string;
          notificationsEnabled?: boolean;
          gerantPinOnboarded?: boolean;
          livreurPin?: string;
          livreurPinOnboarded?: boolean;
        };
        if (p.orders) {
          p.orders = p.orders.map((o) => ({
            ...o,
            status: normalizeOrderStatus(o.status),
          }));
        }
        if (version < 4) {
          const pin = p.managerPin ?? DEFAULT_ROLE_PIN;
          p.gerantPinOnboarded = pin !== DEFAULT_ROLE_PIN;
          p.livreurPin = p.livreurPin ?? DEFAULT_ROLE_PIN;
          p.livreurPinOnboarded = true;
        }
        if (version < 5) {
          (p as { autonomousDemoEnabled?: boolean }).autonomousDemoEnabled = false;
          (p as { autonomousPacePreset?: AutonomousPacePresetId }).autonomousPacePreset = 'demo';
        }
        return p;
      },
      partialize: (s) => ({
        orders: s.orders,
        managerPin: s.managerPin,
        gerantPinOnboarded: s.gerantPinOnboarded,
        livreurPin: s.livreurPin,
        livreurPinOnboarded: s.livreurPinOnboarded,
        notificationsEnabled: s.notificationsEnabled,
        autonomousDemoEnabled: s.autonomousDemoEnabled,
        autonomousPacePreset: s.autonomousPacePreset,
      }),
    }
  )
);

export { ANGERS_DEFAULT };

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ASSISTANT_MAX_STORED_MESSAGES } from '@/constants/assistantLimits';
import type { SubscriptionTierId } from '@/constants/subscriptionPlans';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

type AssistantState = {
  tier: SubscriptionTierId | null;
  messages: ChatMessage[];
  setTier: (tier: SubscriptionTierId | null) => void;
  clearChat: () => void;
  appendMessages: (...msgs: ChatMessage[]) => void;
};

const DEFAULT_TIER: SubscriptionTierId = 'premium';

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set) => ({
      tier: DEFAULT_TIER,
      messages: [],
      setTier: (tier) => set({ tier }),
      clearChat: () => set({ messages: [] }),
      appendMessages: (...msgs) =>
        set((s) => {
          const next = [...s.messages, ...msgs];
          return {
            messages:
              next.length > ASSISTANT_MAX_STORED_MESSAGES
                ? next.slice(-ASSISTANT_MAX_STORED_MESSAGES)
                : next,
          };
        }),
    }),
    {
      name: 'husko-assistant-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ tier: s.tier, messages: s.messages }),
      merge: (persisted, current) => {
        const p = persisted as Partial<AssistantState> | undefined;
        if (!p) return current;
        const raw = p.messages ?? current.messages;
        const messages =
          raw.length > ASSISTANT_MAX_STORED_MESSAGES
            ? raw.slice(-ASSISTANT_MAX_STORED_MESSAGES)
            : raw;
        return {
          ...current,
          messages,
          tier: p.tier == null ? DEFAULT_TIER : p.tier,
        };
      },
    },
  ),
);

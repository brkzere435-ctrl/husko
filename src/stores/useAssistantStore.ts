import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SubscriptionTierId } from '@/constants/subscriptionPlans';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

type AssistantState = {
  tier: SubscriptionTierId | null;
  messages: ChatMessage[];
  setTier: (tier: SubscriptionTierId | null) => void;
  clearChat: () => void;
  appendMessages: (...msgs: ChatMessage[]) => void;
};

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set) => ({
      tier: null,
      messages: [],
      setTier: (tier) => set({ tier }),
      clearChat: () => set({ messages: [] }),
      appendMessages: (...msgs) =>
        set((s) => ({ messages: [...s.messages, ...msgs] })),
    }),
    {
      name: 'husko-assistant-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ tier: s.tier, messages: s.messages }),
    },
  ),
);

import { create } from 'zustand';

export type TechnicalFeedbackPayload = {
  title: string;
  body: string;
  /** Détail technique (affiché seulement en __DEV__ ou pour copie support). */
  detail?: string;
};

type State = {
  payload: TechnicalFeedbackPayload | null;
  setPayload: (p: TechnicalFeedbackPayload | null) => void;
};

/**
 * Charge utile one-shot pour l’écran `/feedback/technical` (erreurs techniques présentables).
 */
export const useTechnicalFeedbackStore = create<State>((set) => ({
  payload: null,
  setPayload: (p) => set({ payload: p }),
}));

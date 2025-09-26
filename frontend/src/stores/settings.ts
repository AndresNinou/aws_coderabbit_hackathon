import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ApiKeys {
  senso?: string;
  nodezero?: string;
}

interface SettingsStore {
  apiKeys: ApiKeys;
  setApiKey: (service: keyof ApiKeys, key: string) => void;
  clearApiKeys: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      apiKeys: {},
      setApiKey: (service, key) =>
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [service]: key,
          },
        })),
      clearApiKeys: () => set({ apiKeys: {} }),
    }),
    {
      name: "hermetiq-settings",
      partialize: (state) => ({ apiKeys: state.apiKeys }),
    },
  ),
);

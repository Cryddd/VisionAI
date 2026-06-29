import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { VisionRuntimeConfig } from '../services/ai/types';

const STORAGE_KEY = 'visionai.settings.v1';

type Extra = {
  geminiApiKey?: string;
  geminiModel?: string;
  roboflowApiKey?: string;
  roboflowModel?: string;
};

const extra: Extra = (Constants.expoConfig?.extra as Extra) ?? {};

const defaults: VisionRuntimeConfig = {
  geminiApiKey: extra.geminiApiKey ?? '',
  geminiModel: extra.geminiModel ?? 'gemini-2.5-flash',
  roboflowApiKey: extra.roboflowApiKey ?? '',
  roboflowModel: extra.roboflowModel ?? '',
};

interface SettingsContextValue {
  config: VisionRuntimeConfig;
  ready: boolean;
  hasGeminiKey: boolean;
  roboflowEnabled: boolean;
  update: (patch: Partial<VisionRuntimeConfig>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<VisionRuntimeConfig>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<VisionRuntimeConfig>;
          setConfig((prev) => ({ ...prev, ...saved }));
        }
      } catch {
        /* keep defaults */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const update = useCallback(
    async (patch: Partial<VisionRuntimeConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...patch };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      config,
      ready,
      hasGeminiKey: Boolean(config.geminiApiKey),
      roboflowEnabled: Boolean(config.roboflowApiKey && config.roboflowModel),
      update,
    }),
    [config, ready, update]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

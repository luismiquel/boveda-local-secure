
import { create } from 'zustand';
import { AppSettings, SecurityConfig } from '../domain/types';
import { Logger } from '../infra/db';

interface BovedaState {
  isSetup: boolean;
  isLocked: boolean;
  dek: CryptoKey | null;
  config: SecurityConfig | null;
  failedAttempts: number;
  lockUntil: number | null;
  settings: AppSettings;
  
  setup: (config: SecurityConfig, dek: CryptoKey) => void;
  unlock: (dek: CryptoKey) => void;
  lock: () => void;
  recordFailure: () => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  wipe: () => Promise<void>;
}

const STORAGE_KEYS = {
  CONFIG: 'bv_sec_cfg',
  SETTINGS: 'bv_settings',
  FAILURES: 'bv_fail_count',
  LOCK_TIME: 'bv_lock_until'
};

const getSafeJSON = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const getSafeItem = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn("Storage access denied", e);
    return null;
  }
};

export const useStore = create<BovedaState>((set, get) => ({
  isSetup: !!getSafeItem(STORAGE_KEYS.CONFIG),
  isLocked: true,
  dek: null,
  config: getSafeJSON(STORAGE_KEYS.CONFIG, null),
  failedAttempts: Number(getSafeItem(STORAGE_KEYS.FAILURES) || '0'),
  lockUntil: Number(getSafeItem(STORAGE_KEYS.LOCK_TIME) || '0') || null,
  settings: getSafeJSON(STORAGE_KEYS.SETTINGS, {
    seniorMode: false,
    autoLockMinutes: 5,
    panicModeEnabled: false
  }),

  setup: (config, dek) => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    set({ config, dek, isSetup: true, isLocked: false });
    Logger.log("SISTEMA", "Bóveda configurada por primera vez");
  },

  unlock: (dek) => {
    set({ dek, isLocked: false, failedAttempts: 0, lockUntil: null });
    localStorage.removeItem(STORAGE_KEYS.FAILURES);
    localStorage.removeItem(STORAGE_KEYS.LOCK_TIME);
    Logger.log("SEGURIDAD", "Bóveda desbloqueada correctamente");
  },

  lock: () => {
    set({ dek: null, isLocked: true });
    Logger.log("SEGURIDAD", "Bóveda bloqueada");
  },

  recordFailure: () => {
    const next = get().failedAttempts + 1;
    let lockUntil = null;
    if (next >= 3) {
      lockUntil = Date.now() + (Math.pow(2, next - 3) * 30 * 1000);
      localStorage.setItem(STORAGE_KEYS.LOCK_TIME, lockUntil.toString());
    }
    localStorage.setItem(STORAGE_KEYS.FAILURES, next.toString());
    set({ failedAttempts: next, lockUntil });
    Logger.log("ALERTA", `Intento fallido de acceso (${next})`);
  },

  updateSettings: (newSettings) => set((state) => {
    const settings = { ...state.settings, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return { settings };
  }),

  wipe: async () => {
    await Logger.log("PELIGRO", "Ejecutando destrucción total de datos (Wipe)");
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    const databases = await indexedDB.databases();
    for (const dbInfo of databases) {
      if (dbInfo.name) indexedDB.deleteDatabase(dbInfo.name);
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) await reg.unregister();
    }
    const cachesKeys = await caches.keys();
    for (const key of cachesKeys) await caches.delete(key);
    window.location.reload();
  }
}));

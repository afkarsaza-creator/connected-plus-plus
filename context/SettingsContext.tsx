import React, { createContext, useState, useContext, useEffect } from 'react';
import type { Settings } from '../types';

interface SettingsContextType {
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  toggleTheme: () => void;
  theme: 'dark' | 'light';
}

const SETTINGS_STORAGE_KEY = 'cONnectedPlus_Settings';

const defaultSettings: Settings = {
    theme: 'dark',
    textSize: 16,
    cornerRadius: 12,
    globalAutoDeleteTimer: 'off',
    notificationsPrivate: true,
    notificationsGroups: true,
    privateTone: 'Default',
    groupTone: 'Default',
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
        const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
            // Gabungkan pengaturan yang disimpan dengan default untuk memastikan
            // semua kunci ada jika versi baru aplikasi menambahkan pengaturan baru
            return { ...defaultSettings, ...JSON.parse(storedSettings) };
        }
    } catch (error) {
        console.error("Gagal memuat pengaturan dari localStorage:", error);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Gagal menyimpan pengaturan ke localStorage:", error);
    }
  }, [settings]);

  const setSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };
  
  const value = {
    settings,
    setSetting,
    toggleTheme,
    theme: settings.theme,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === null) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

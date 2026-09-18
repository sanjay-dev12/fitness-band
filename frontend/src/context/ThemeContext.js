import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'handband_theme';

export const DARK_THEME = {
  mode: 'dark',
  // Backgrounds
  bg: '#001F27',
  bgCard: '#002B36',
  bgCardAlt: '#00232C',
  bgCardDeep: '#002028',
  bgInput: '#002028',
  bgNavBar: '#00252F',
  bgTag: 'rgba(0,191,165,0.12)',
  bgTagBorder: 'rgba(0,191,165,0.25)',
  bgDanger: 'rgba(255,75,75,0.1)',
  bgDangerBorder: 'rgba(255,75,75,0.25)',
  bgSuccess: 'rgba(0,230,118,0.12)',
  bgSuccessBorder: 'rgba(0,230,118,0.3)',
  bgProgressTrack: 'rgba(122,158,168,0.15)',
  // Borders
  border: 'rgba(122,158,168,0.15)',
  borderSub: 'rgba(122,158,168,0.1)',
  borderFaint: 'rgba(122,158,168,0.08)',
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8FAAB2',
  textMuted: '#6A8791',
  textAccent: '#00BFA5',
  textDanger: '#FF4B4B',
  textSuccess: '#00E676',
  textOnAccent: '#001F27',
  // Accent
  accent: '#00BFA5',
  accentBright: '#00E676',
  // Tab bar
  tabActive: '#00BFA5',
  tabInactive: '#7A9EA8',
  // Status bar style
  statusBar: 'light',
};

export const LIGHT_THEME = {
  mode: 'light',
  // Backgrounds
  bg: '#F2F6FB',
  bgCard: '#FFFFFF',
  bgCardAlt: '#E8F1FA',
  bgCardDeep: '#D9E8F5',
  bgInput: '#EAF2FB',
  bgNavBar: '#FFFFFF',
  bgTag: 'rgba(30,136,229,0.1)',
  bgTagBorder: 'rgba(30,136,229,0.3)',
  bgDanger: 'rgba(211,47,47,0.07)',
  bgDangerBorder: 'rgba(211,47,47,0.22)',
  bgSuccess: 'rgba(0,150,136,0.08)',
  bgSuccessBorder: 'rgba(0,150,136,0.25)',
  bgProgressTrack: 'rgba(30,136,229,0.12)',
  // Borders
  border: 'rgba(30,136,229,0.15)',
  borderSub: 'rgba(30,136,229,0.09)',
  borderFaint: 'rgba(30,136,229,0.06)',
  // Text
  textPrimary: '#1F2937', // Standard dark gray/slate for readability
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textAccent: '#1E88E5',
  textDanger: '#C62828',
  textSuccess: '#00796B',
  textOnAccent: '#FFFFFF',
  // Accent
  accent: '#1E88E5',
  accentBright: '#29B6F6',
  // Tab bar
  tabActive: '#1E88E5',
  tabInactive: '#7A9BB5',
  // Status bar style
  statusBar: 'dark',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DARK_THEME);

  // Load saved theme on mount (Android/iOS: AsyncStorage, Web: localStorage)
  useEffect(() => {
    const loadTheme = async () => {
      try {
        let saved = null;
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          saved = window.localStorage.getItem(THEME_STORAGE_KEY);
        } else {
          saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        }
        if (saved === 'light') setTheme(LIGHT_THEME);
        else setTheme(DARK_THEME);
      } catch (e) {
        setTheme(DARK_THEME);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev.mode === 'dark' ? LIGHT_THEME : DARK_THEME;
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(THEME_STORAGE_KEY, next.mode);
        } else {
          AsyncStorage.setItem(THEME_STORAGE_KEY, next.mode);
        }
      } catch (e) {}
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme.mode === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

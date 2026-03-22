import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type BillingMode = 'relative' | 'first_of_month';

interface SettingsState {
  theme: Theme;
  billingMode: BillingMode;
  gracePeriodDays: number;
  warningDays: number;
}

interface SettingsContextType extends SettingsState {
  setTheme: (theme: Theme) => void;
  setBillingMode: (mode: BillingMode) => void;
  setGracePeriodDays: (days: number) => void;
  setWarningDays: (days: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('nexus_theme') as Theme | null;
    // Fallback if 'system' was previously saved
    if (!saved || saved === ('system' as string)) return 'dark';
    return saved;
  });
  
  const [billingMode, setBillingMode] = useState<BillingMode>(
    () => (localStorage.getItem('nexus_billing_mode') as BillingMode) || 'relative'
  );

  const [gracePeriodDays, setGracePeriodDays] = useState<number>(
    () => parseInt(localStorage.getItem('nexus_grace_period_days') || '0', 10)
  );

  const [warningDays, setWarningDays] = useState<number>(
    () => parseInt(localStorage.getItem('nexus_warning_days') || '3', 10)
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nexus_billing_mode', billingMode);
  }, [billingMode]);

  useEffect(() => {
    localStorage.setItem('nexus_grace_period_days', gracePeriodDays.toString());
  }, [gracePeriodDays]);

  useEffect(() => {
    localStorage.setItem('nexus_warning_days', warningDays.toString());
  }, [warningDays]);

  return (
    <SettingsContext.Provider value={{
      theme, billingMode, gracePeriodDays, warningDays,
      setTheme, setBillingMode, setGracePeriodDays, setWarningDays
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

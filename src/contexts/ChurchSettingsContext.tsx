import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode, CURRENCIES, Currency } from '@/types/currency';

export interface ChurchInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  motto?: string;
}

export interface ChurchSettings {
  currency: CurrencyCode;
  churchInfo: ChurchInfo;
  notifications: {
    largeTransactionAlerts: boolean;
    monthlyReportReminders: boolean;
    backupReminders: boolean;
  };
  security: {
    require2FA: boolean;
    sessionTimeout: boolean;
    auditLogging: boolean;
  };
}

const DEFAULT_SETTINGS: ChurchSettings = {
  currency: 'USD',
  churchInfo: {
    name: 'Grace Community Church',
    address: '123 Faith Avenue, City',
    phone: '+1 234 567 8900',
    email: 'info@gracechurch.org',
    motto: 'Building Faith, Serving Community',
  },
  notifications: {
    largeTransactionAlerts: true,
    monthlyReportReminders: true,
    backupReminders: true,
  },
  security: {
    require2FA: false,
    sessionTimeout: true,
    auditLogging: true,
  },
};

interface ChurchSettingsContextType {
  settings: ChurchSettings;
  updateSettings: (newSettings: Partial<ChurchSettings>) => void;
  updateChurchInfo: (info: Partial<ChurchInfo>) => void;
  updateCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;
  getCurrency: () => Currency;
}

const ChurchSettingsContext = createContext<ChurchSettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'church-accounting-settings';

export function ChurchSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ChurchSettings>(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        } catch {
          return DEFAULT_SETTINGS;
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Persist to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<ChurchSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateChurchInfo = (info: Partial<ChurchInfo>) => {
    setSettings((prev) => ({
      ...prev,
      churchInfo: { ...prev.churchInfo, ...info },
    }));
  };

  const updateCurrency = (currency: CurrencyCode) => {
    setSettings((prev) => ({ ...prev, currency }));
  };

  const getCurrency = (): Currency => {
    return CURRENCIES[settings.currency];
  };

  const formatCurrency = (amount: number): string => {
    const currency = getCurrency();
    
    // Handle ZIG specially since it may not be in all browsers
    if (currency.code === 'ZIG') {
      return `ZiG ${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    try {
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      // Fallback for unsupported currencies
      return `${currency.symbol}${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  };

  return (
    <ChurchSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateChurchInfo,
        updateCurrency,
        formatCurrency,
        getCurrency,
      }}
    >
      {children}
    </ChurchSettingsContext.Provider>
  );
}

export function useChurchSettings() {
  const context = useContext(ChurchSettingsContext);
  if (context === undefined) {
    throw new Error('useChurchSettings must be used within a ChurchSettingsProvider');
  }
  return context;
}

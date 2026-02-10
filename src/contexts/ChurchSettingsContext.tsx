import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode, CURRENCIES, Currency } from '@/types/currency';
import { supabase } from '@/integrations/supabase/client';

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
  loading: boolean;
}

const ChurchSettingsContext = createContext<ChurchSettingsContextType | undefined>(undefined);

// Helper to map DB row to ChurchSettings
function rowToSettings(row: any): ChurchSettings {
  return {
    currency: (row.currency || 'USD') as CurrencyCode,
    churchInfo: {
      name: row.name || '',
      address: row.address || '',
      phone: row.phone || '',
      email: row.email || '',
      logo: row.logo || undefined,
      motto: row.motto || undefined,
    },
    notifications: row.notifications as ChurchSettings['notifications'] ?? DEFAULT_SETTINGS.notifications,
    security: row.security as ChurchSettings['security'] ?? DEFAULT_SETTINGS.security,
  };
}

export function ChurchSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ChurchSettings>(DEFAULT_SETTINGS);
  const [dbId, setDbId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch settings from DB on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('church_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          setSettings(rowToSettings(data));
          setDbId(data.id);
        }
      } catch {
        // Fall back to defaults
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const persistToDb = async (updated: ChurchSettings) => {
    if (!dbId) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('church_settings')
      .update({
        name: updated.churchInfo.name,
        address: updated.churchInfo.address,
        phone: updated.churchInfo.phone,
        email: updated.churchInfo.email,
        motto: updated.churchInfo.motto || null,
        logo: updated.churchInfo.logo || null,
        currency: updated.currency,
        notifications: updated.notifications as any,
        security: updated.security as any,
        updated_by: user?.id || null,
      })
      .eq('id', dbId);
  };

  const updateSettings = (newSettings: Partial<ChurchSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      persistToDb(updated);
      return updated;
    });
  };

  const updateChurchInfo = (info: Partial<ChurchInfo>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        churchInfo: { ...prev.churchInfo, ...info },
      };
      persistToDb(updated);
      return updated;
    });
  };

  const updateCurrency = (currency: CurrencyCode) => {
    setSettings((prev) => {
      const updated = { ...prev, currency };
      persistToDb(updated);
      return updated;
    });
  };

  const getCurrency = (): Currency => {
    return CURRENCIES[settings.currency];
  };

  const formatCurrency = (amount: number): string => {
    const currency = getCurrency();
    
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
        loading,
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

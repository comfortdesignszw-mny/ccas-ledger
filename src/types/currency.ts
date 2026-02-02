// Currency types for multi-currency support

export type CurrencyCode = 'USD' | 'ZIG' | 'ZAR' | 'BWP';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    locale: 'en-US',
  },
  ZIG: {
    code: 'ZIG',
    name: 'Zimbabwe Gold',
    symbol: 'ZiG',
    locale: 'en-ZW',
  },
  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    locale: 'en-ZA',
  },
  BWP: {
    code: 'BWP',
    name: 'Botswana Pula',
    symbol: 'P',
    locale: 'en-BW',
  },
};

export const CURRENCY_LIST: Currency[] = Object.values(CURRENCIES);

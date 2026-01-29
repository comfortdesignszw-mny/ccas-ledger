// Core types for Church Accounting System

export type UserRole = 'admin' | 'finance_officer' | 'leader' | 'auditor';

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'bank' | 'mobile_money';

export type CategoryType = 'income' | 'expense' | 'asset' | 'liability';

export type AssetStatus = 'active' | 'damaged' | 'sold';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: 'active' | 'disabled';
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  description?: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  transactionDate: Date;
  amount: number;
  categoryId: string;
  category?: Category;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  description: string;
  recordedBy: string;
  recordedByUser?: User;
  createdAt: Date;
}

export interface CashBalance {
  id: string;
  balanceDate: Date;
  openingBalance: number;
  closingBalance: number;
  calculatedAt: Date;
}

export interface ChurchEvent {
  id: string;
  eventName: string;
  eventDate: Date;
  expectedContributionPerMember: number;
  description?: string;
  createdAt: Date;
}

export interface EventContribution {
  id: string;
  eventId: string;
  transactionId: string;
  amount: number;
  createdAt: Date;
}

export interface Asset {
  id: string;
  assetName: string;
  category: string;
  serialNumber?: string;
  location?: string;
  purchaseDate: Date;
  purchaseValue: number;
  status: AssetStatus;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: Date;
}

// Dashboard summary types
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeChange: number;
  expenseChange: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

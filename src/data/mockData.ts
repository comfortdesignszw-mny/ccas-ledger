import { Category } from '@/types';

// Keep categories for backward compatibility with TransactionForm
// These will be replaced by database categories when auth is ready
export const categories: Category[] = [];

// Legacy format currency - use useChurchSettings().formatCurrency instead
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

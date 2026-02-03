import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  transaction_date: string;
  amount: number;
  category_id: string;
  type: 'income' | 'expense';
  payment_method: 'cash' | 'bank' | 'mobile_money';
  description: string;
  recorded_by: string;
  created_at: string;
  categories?: {
    id: string;
    name: string;
    type: 'income' | 'expense';
  };
}

export interface TransactionInput {
  transaction_date: string;
  amount: number;
  category_id: string;
  type: 'income' | 'expense';
  payment_method: 'cash' | 'bank' | 'mobile_money';
  description: string;
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            id,
            name,
            type
          )
        `)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TransactionInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to add transactions');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...input,
          recorded_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add transaction');
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete transaction');
    },
  });
}

// Helper functions for computing summaries
export function getFinancialSummary(transactions: Transaction[]) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const thisMonthTransactions = transactions.filter(t => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const lastMonthTransactions = transactions.filter(t => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  const thisMonthIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const thisMonthExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const lastMonthIncome = lastMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const lastMonthExpenses = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const incomeChange = lastMonthIncome > 0 
    ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 
    : 0;
  const expenseChange = lastMonthExpenses > 0 
    ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
    : 0;

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    totalIncome: thisMonthIncome,
    totalExpenses: thisMonthExpenses,
    netBalance: totalIncome - totalExpenses,
    incomeChange,
    expenseChange,
  };
}

export function getMonthlyData(transactions: Transaction[]) {
  const months: Array<{ month: string; income: number; expenses: number }> = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });

    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.transaction_date);
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    months.push({ month: monthName, income, expenses });
  }

  return months;
}

export function getCategorySummary(transactions: Transaction[], type: 'income' | 'expense') {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const thisMonthTransactions = transactions.filter(t => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear && t.type === type;
  });

  const total = thisMonthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryTotals = new Map<string, number>();

  thisMonthTransactions.forEach(t => {
    const categoryName = t.categories?.name || 'Unknown';
    categoryTotals.set(categoryName, (categoryTotals.get(categoryName) || 0) + Number(t.amount));
  });

  const colors = type === 'income'
    ? ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22']
    : ['#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12', '#431407'];

  return Array.from(categoryTotals.entries())
    .map(([category, amount], index) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.amount - a.amount);
}

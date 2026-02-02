import { Transaction, Category, FinancialSummary, MonthlyData, CategorySummary, User } from '@/types';

// Mock Categories
export const categories: Category[] = [
  // Income categories
  { id: '1', name: 'Tithes', type: 'income', description: 'Regular tithes from members', createdAt: new Date() },
  { id: '2', name: 'Offerings', type: 'income', description: 'Weekly offerings', createdAt: new Date() },
  { id: '3', name: 'Donations', type: 'income', description: 'Special donations', createdAt: new Date() },
  { id: '4', name: 'Fundraising', type: 'income', description: 'Fundraising events', createdAt: new Date() },
  { id: '5', name: 'Pledges', type: 'income', description: 'Member pledges', createdAt: new Date() },
  { id: '6', name: 'Special Projects', type: 'income', description: 'Special project funds', createdAt: new Date() },
  // Expense categories
  { id: '7', name: 'Utilities', type: 'expense', description: 'Electricity, water, internet', createdAt: new Date() },
  { id: '8', name: 'Maintenance', type: 'expense', description: 'Building and equipment maintenance', createdAt: new Date() },
  { id: '9', name: 'Church Programs', type: 'expense', description: 'Ministry programs and events', createdAt: new Date() },
  { id: '10', name: 'Equipment', type: 'expense', description: 'Equipment purchases', createdAt: new Date() },
  { id: '11', name: 'Administrative', type: 'expense', description: 'Office supplies and admin costs', createdAt: new Date() },
  { id: '12', name: 'Salaries', type: 'expense', description: 'Staff salaries', createdAt: new Date() },
];

// Mock current user
export const currentUser: User = {
  id: 'user-1',
  fullName: 'John Mwangi',
  email: 'john.mwangi@church.org',
  role: 'finance_officer',
  status: 'active',
  createdAt: new Date('2023-01-15'),
};

// Generate realistic transactions for the last 6 months
const generateTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  const incomeData = [
    { categoryId: '1', description: 'Sunday Tithes', minAmount: 50000, maxAmount: 150000 },
    { categoryId: '2', description: 'Weekly Offering', minAmount: 20000, maxAmount: 80000 },
    { categoryId: '3', description: 'Anonymous Donation', minAmount: 10000, maxAmount: 500000 },
    { categoryId: '4', description: 'Youth Fundraiser', minAmount: 30000, maxAmount: 100000 },
    { categoryId: '5', description: 'Building Fund Pledge', minAmount: 50000, maxAmount: 200000 },
  ];

  const expenseData = [
    { categoryId: '7', description: 'Monthly Electricity Bill', minAmount: 15000, maxAmount: 35000 },
    { categoryId: '7', description: 'Water Bill', minAmount: 5000, maxAmount: 12000 },
    { categoryId: '8', description: 'Roof Repairs', minAmount: 20000, maxAmount: 80000 },
    { categoryId: '9', description: 'Youth Conference', minAmount: 40000, maxAmount: 120000 },
    { categoryId: '10', description: 'Sound System Parts', minAmount: 25000, maxAmount: 75000 },
    { categoryId: '11', description: 'Office Supplies', minAmount: 5000, maxAmount: 20000 },
    { categoryId: '12', description: 'Pastor Allowance', minAmount: 80000, maxAmount: 80000 },
  ];

  const paymentMethods: Array<'cash' | 'bank' | 'mobile_money'> = ['cash', 'bank', 'mobile_money'];
  
  // Generate transactions for each week of the last 6 months
  for (let week = 0; week < 26; week++) {
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - (week * 7));
    
    // 2-4 income transactions per week
    const incomeCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < incomeCount; i++) {
      const income = incomeData[Math.floor(Math.random() * incomeData.length)];
      const amount = Math.floor(Math.random() * (income.maxAmount - income.minAmount) + income.minAmount);
      
      transactions.push({
        id: `trans-income-${week}-${i}`,
        transactionDate: new Date(weekDate),
        amount,
        categoryId: income.categoryId,
        category: categories.find(c => c.id === income.categoryId),
        type: 'income',
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        description: income.description,
        recordedBy: 'user-1',
        createdAt: new Date(weekDate),
      });
    }
    
    // 1-3 expense transactions per week
    const expenseCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < expenseCount; i++) {
      const expense = expenseData[Math.floor(Math.random() * expenseData.length)];
      const amount = Math.floor(Math.random() * (expense.maxAmount - expense.minAmount) + expense.minAmount);
      
      transactions.push({
        id: `trans-expense-${week}-${i}`,
        transactionDate: new Date(weekDate),
        amount,
        categoryId: expense.categoryId,
        category: categories.find(c => c.id === expense.categoryId),
        type: 'expense',
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        description: expense.description,
        recordedBy: 'user-1',
        createdAt: new Date(weekDate),
      });
    }
  }
  
  return transactions.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
};

export const transactions = generateTransactions();

// Calculate financial summary
export const getFinancialSummary = (trans: Transaction[] = transactions): FinancialSummary => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  const thisMonthTransactions = trans.filter(t => {
    const d = new Date(t.transactionDate);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
  
  const lastMonthTransactions = trans.filter(t => {
    const d = new Date(t.transactionDate);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });
  
  const thisMonthIncome = thisMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const thisMonthExpenses = thisMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  const lastMonthIncome = lastMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const lastMonthExpenses = lastMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  const incomeChange = lastMonthIncome > 0 ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
  const expenseChange = lastMonthExpenses > 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;
  
  const totalIncome = trans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = trans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalIncome: thisMonthIncome,
    totalExpenses: thisMonthExpenses,
    netBalance: totalIncome - totalExpenses,
    incomeChange,
    expenseChange,
  };
};

// Get monthly data for charts
export const getMonthlyData = (trans: Transaction[] = transactions): MonthlyData[] => {
  const months: MonthlyData[] = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const monthTransactions = trans.filter(t => {
      const d = new Date(t.transactionDate);
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    });
    
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    months.push({ month: monthName, income, expenses });
  }
  
  return months;
};

// Get category summary
export const getCategorySummary = (type: 'income' | 'expense', trans: Transaction[] = transactions): CategorySummary[] => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  const thisMonthTransactions = trans.filter(t => {
    const d = new Date(t.transactionDate);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear && t.type === type;
  });
  
  const total = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const categoryTotals = new Map<string, number>();
  
  thisMonthTransactions.forEach(t => {
    const categoryName = t.category?.name || 'Unknown';
    categoryTotals.set(categoryName, (categoryTotals.get(categoryName) || 0) + t.amount);
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
};

// Recent transactions
export const getRecentTransactions = (limit: number = 10, trans: Transaction[] = transactions): Transaction[] => {
  return trans.slice(0, limit);
};

// Legacy format currency - use useChurchSettings().formatCurrency instead
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

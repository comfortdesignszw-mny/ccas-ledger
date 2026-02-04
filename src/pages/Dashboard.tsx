import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { FloatingActionButton } from '@/components/layout/FloatingActionButton';
import { 
  useTransactions, 
  getFinancialSummary, 
  getMonthlyData, 
  getCategorySummary 
} from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { useChurchSettings } from '@/contexts/ChurchSettingsContext';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: transactions = [], isLoading } = useTransactions();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  const summary = getFinancialSummary(transactions);
  const monthlyData = getMonthlyData(transactions);
  const incomeSummary = getCategorySummary(transactions, 'income');
  const expenseSummary = getCategorySummary(transactions, 'expense');
  const recentTransactions = transactions.slice(0, 8);

  return (
    <AppLayout>
      <Header
        title="Dashboard"
        subtitle="Overview of your church finances"
        showAddButton
        onAddClick={() => setTransactionDialogOpen(true)}
        addButtonLabel="Add Transaction"
      />

      <div className="page-container">
        {/* Metric Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <MetricCard
                title="Monthly Income"
                value={summary.totalIncome}
                change={summary.incomeChange}
                icon={TrendingUp}
                variant="income"
              />
              <MetricCard
                title="Monthly Expenses"
                value={summary.totalExpenses}
                change={summary.expenseChange}
                icon={TrendingDown}
                variant="expense"
              />
              <MetricCard
                title="Net This Month"
                value={summary.totalIncome - summary.totalExpenses}
                icon={PiggyBank}
                variant="default"
              />
              <MetricCard
                title="Total Balance"
                value={summary.netBalance}
                icon={Wallet}
                variant="balance"
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid gap-6 lg:grid-cols-4">
          <IncomeExpenseChart data={monthlyData} />
          <CategoryPieChart
            data={incomeSummary}
            title="Income by Category"
            emptyMessage="No income recorded this month"
          />
          <CategoryPieChart
            data={expenseSummary}
            title="Expenses by Category"
            emptyMessage="No expenses recorded this month"
          />
        </div>

        {/* Recent Transactions */}
        <div className="grid gap-6 lg:grid-cols-4">
          <RecentTransactions transactions={recentTransactions} />
          
          {/* Quick Actions Card */}
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 font-semibold">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionButton
                  label="Record Tithe"
                  description="Add tithe payment"
                  color="bg-income/10 text-income hover:bg-income/20"
                  onClick={() => setTransactionDialogOpen(true)}
                />
                <QuickActionButton
                  label="Record Offering"
                  description="Add weekly offering"
                  color="bg-income/10 text-income hover:bg-income/20"
                  onClick={() => setTransactionDialogOpen(true)}
                />
                <QuickActionButton
                  label="Pay Bill"
                  description="Record an expense"
                  color="bg-expense/10 text-expense hover:bg-expense/20"
                  onClick={() => setTransactionDialogOpen(true)}
                />
                <QuickActionButton
                  label="Generate Report"
                  description="Create financial report"
                  color="bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={() => window.location.href = '/reports'}
                />
              </div>
            </div>

            {/* Empty state message */}
            {transactions.length === 0 && (
              <div className="rounded-xl border bg-card p-6 text-center">
                <p className="text-muted-foreground">
                  No transactions yet. Click "Add Transaction" to get started!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <TransactionDialog 
        open={transactionDialogOpen} 
        onOpenChange={setTransactionDialogOpen} 
      />

      <FloatingActionButton onClick={() => setTransactionDialogOpen(true)} />
    </AppLayout>
  );
};

function QuickActionButton({
  label,
  description,
  color,
  onClick,
}: {
  label: string;
  description: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start rounded-lg p-4 text-left transition-colors ${color}`}
    >
      <span className="font-medium">{label}</span>
      <span className="text-xs opacity-80">{description}</span>
    </button>
  );
}

export default Dashboard;

import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import {
  getFinancialSummary,
  getMonthlyData,
  getCategorySummary,
  getRecentTransactions,
} from '@/data/mockData';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';

const Dashboard = () => {
  const summary = getFinancialSummary();
  const monthlyData = getMonthlyData();
  const incomeSummary = getCategorySummary('income');
  const expenseSummary = getCategorySummary('expense');
  const recentTransactions = getRecentTransactions(8);

  return (
    <AppLayout>
      <Header
        title="Dashboard"
        subtitle="Overview of your church finances"
        showAddButton
        onAddClick={() => {}}
        addButtonLabel="Add Transaction"
      />

      <div className="page-container">
        {/* Metric Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                />
                <QuickActionButton
                  label="Record Offering"
                  description="Add weekly offering"
                  color="bg-income/10 text-income hover:bg-income/20"
                />
                <QuickActionButton
                  label="Pay Bill"
                  description="Record an expense"
                  color="bg-expense/10 text-expense hover:bg-expense/20"
                />
                <QuickActionButton
                  label="Generate Report"
                  description="Create financial report"
                  color="bg-primary/10 text-primary hover:bg-primary/20"
                />
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 font-semibold">Upcoming Church Events</h3>
              <div className="space-y-3">
                <UpcomingEvent
                  name="Feast of Booths"
                  date="Feb 15, 2025"
                  expectedCollection="KES 250,000"
                />
                <UpcomingEvent
                  name="Easter Service"
                  date="Apr 20, 2025"
                  expectedCollection="KES 500,000"
                />
                <UpcomingEvent
                  name="Youth Conference"
                  date="May 10, 2025"
                  expectedCollection="KES 150,000"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

function QuickActionButton({
  label,
  description,
  color,
}: {
  label: string;
  description: string;
  color: string;
}) {
  return (
    <button
      className={`flex flex-col items-start rounded-lg p-4 text-left transition-colors ${color}`}
    >
      <span className="font-medium">{label}</span>
      <span className="text-xs opacity-80">{description}</span>
    </button>
  );
}

function UpcomingEvent({
  name,
  date,
  expectedCollection,
}: {
  name: string;
  date: string;
  expectedCollection: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-income">{expectedCollection}</p>
        <p className="text-xs text-muted-foreground">Expected</p>
      </div>
    </div>
  );
}

export default Dashboard;

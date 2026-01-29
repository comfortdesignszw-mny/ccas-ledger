import { useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Printer,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  transactions,
  categories,
  formatCurrency,
  getMonthlyData,
} from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('current');
  const monthlyData = getMonthlyData();

  // Get report date range
  const getDateRange = () => {
    if (selectedMonth === 'current') {
      return {
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
        label: format(new Date(), 'MMMM yyyy'),
      };
    }
    const monthsAgo = parseInt(selectedMonth);
    const date = subMonths(new Date(), monthsAgo);
    return {
      start: startOfMonth(date),
      end: endOfMonth(date),
      label: format(date, 'MMMM yyyy'),
    };
  };

  const dateRange = getDateRange();

  // Filter transactions for selected period
  const periodTransactions = transactions.filter((t) => {
    const date = new Date(t.transactionDate);
    return date >= dateRange.start && date <= dateRange.end;
  });

  const incomeTransactions = periodTransactions.filter(
    (t) => t.type === 'income'
  );
  const expenseTransactions = periodTransactions.filter(
    (t) => t.type === 'expense'
  );

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Group by category
  const incomeByCategory = categories
    .filter((c) => c.type === 'income')
    .map((cat) => {
      const amount = incomeTransactions
        .filter((t) => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: cat.name, amount };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const expensesByCategory = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const amount = expenseTransactions
        .filter((t) => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: cat.name, amount };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <AppLayout>
      <Header title="Reports" subtitle="Financial statements and summaries" />

      <div className="page-container">
        {/* Report Selection */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="1">Last Month</SelectItem>
                <SelectItem value="2">2 Months Ago</SelectItem>
                <SelectItem value="3">3 Months Ago</SelectItem>
                <SelectItem value="6">6 Months Ago</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Financial Summary Report */}
        <Card className="mb-6">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Financial Summary Report
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {dateRange.label}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Generated</p>
                <p className="text-sm font-medium">
                  {format(new Date(), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Summary Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border-l-4 border-l-income bg-income/5 p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-income" />
                  <span className="font-medium">Total Income</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-income">
                  {formatCurrency(totalIncome)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {incomeTransactions.length} transactions
                </p>
              </div>
              <div className="rounded-lg border-l-4 border-l-expense bg-expense/5 p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-expense" />
                  <span className="font-medium">Total Expenses</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-expense">
                  {formatCurrency(totalExpenses)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {expenseTransactions.length} transactions
                </p>
              </div>
              <div
                className={cn(
                  'rounded-lg border-l-4 p-4',
                  totalIncome - totalExpenses >= 0
                    ? 'border-l-income bg-income/5'
                    : 'border-l-expense bg-expense/5'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">Net Balance</span>
                </div>
                <p
                  className={cn(
                    'mt-2 text-2xl font-bold',
                    totalIncome - totalExpenses >= 0
                      ? 'text-income'
                      : 'text-expense'
                  )}
                >
                  {formatCurrency(totalIncome - totalExpenses)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {totalIncome - totalExpenses >= 0 ? 'Surplus' : 'Deficit'}
                </p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Income by Category */}
              <div>
                <h3 className="mb-4 font-semibold">Income by Category</h3>
                <div className="space-y-3">
                  {incomeByCategory.map((cat) => (
                    <div key={cat.name}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{cat.name}</span>
                        <span className="font-medium">
                          {formatCurrency(cat.amount)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-income transition-all"
                          style={{
                            width: `${
                              totalIncome > 0
                                ? (cat.amount / totalIncome) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {incomeByCategory.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No income recorded
                    </p>
                  )}
                </div>
              </div>

              {/* Expenses by Category */}
              <div>
                <h3 className="mb-4 font-semibold">Expenses by Category</h3>
                <div className="space-y-3">
                  {expensesByCategory.map((cat) => (
                    <div key={cat.name}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{cat.name}</span>
                        <span className="font-medium">
                          {formatCurrency(cat.amount)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-expense transition-all"
                          style={{
                            width: `${
                              totalExpenses > 0
                                ? (cat.amount / totalExpenses) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {expensesByCategory.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No expenses recorded
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">6-Month Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    tickFormatter={(value) =>
                      value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
                    }
                    className="text-xs"
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `KES ${value.toLocaleString()}`,
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(160 84% 39%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(160 84% 39%)', r: 4 }}
                    name="Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(15 75% 55%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(15 75% 55%)', r: 4 }}
                    name="Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Reports;

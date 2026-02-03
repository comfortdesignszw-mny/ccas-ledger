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
import { useTransactions, getMonthlyData } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useChurchSettings } from '@/contexts/ChurchSettingsContext';
import { ReportLetterhead } from '@/components/reports/ReportLetterhead';
import { ReportFooter } from '@/components/reports/ReportFooter';
import { usePrintReport } from '@/hooks/usePrintReport';
import { Skeleton } from '@/components/ui/skeleton';

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('current');
  const { formatCurrency } = useChurchSettings();
  const { printRef, handlePrint, handleExportPDF } = usePrintReport();

  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();

  const monthlyData = getMonthlyData(transactions);

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
    const date = new Date(t.transaction_date);
    return date >= dateRange.start && date <= dateRange.end;
  });

  const incomeTransactions = periodTransactions.filter(
    (t) => t.type === 'income'
  );
  const expenseTransactions = periodTransactions.filter(
    (t) => t.type === 'expense'
  );

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = expenseTransactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  // Group by category
  const incomeByCategory = categories
    .filter((c) => c.type === 'income')
    .map((cat) => {
      const amount = incomeTransactions
        .filter((t) => t.category_id === cat.id)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { name: cat.name, amount };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const expensesByCategory = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const amount = expenseTransactions
        .filter((t) => t.category_id === cat.id)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { name: cat.name, amount };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <AppLayout>
      <Header title="Reports" subtitle="Financial statements and summaries" />

      <div className="page-container">
        {/* Report Selection - Hidden on print */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
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
            <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div ref={printRef} className="print:p-0">
          {/* Letterhead */}
          <ReportLetterhead 
            reportTitle="Financial Summary Report"
            reportPeriod={dateRange.label}
            generatedDate={format(new Date(), 'MMMM d, yyyy')}
          />

          {/* Financial Summary Report */}
          <Card className="mb-6 print:shadow-none print:border-0">
            <CardHeader className="border-b bg-muted/30 print:bg-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 print:hidden" />
                    Financial Summary
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {dateRange.label}
                  </p>
                </div>
                <div className="text-right print:hidden">
                  <p className="text-sm text-muted-foreground">Generated</p>
                  <p className="text-sm font-medium">
                    {format(new Date(), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border-l-4 border-l-income bg-income/5 p-4 print:border print:border-income/30">
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
                    <div className="rounded-lg border-l-4 border-l-expense bg-expense/5 p-4 print:border print:border-expense/30">
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
                        'rounded-lg border-l-4 p-4 print:border',
                        totalIncome - totalExpenses >= 0
                          ? 'border-l-income bg-income/5 print:border-income/30'
                          : 'border-l-expense bg-expense/5 print:border-expense/30'
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

                  {/* Transaction Summary Table for Print */}
                  <div className="mt-8 hidden print:block">
                    <h3 className="mb-4 font-semibold">Transaction Summary</h3>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">Category</th>
                          <th className="py-2 text-right">Income</th>
                          <th className="py-2 text-right">Expenses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incomeByCategory.map((cat) => (
                          <tr key={cat.name} className="border-b">
                            <td className="py-2">{cat.name}</td>
                            <td className="py-2 text-right text-income">{formatCurrency(cat.amount)}</td>
                            <td className="py-2 text-right">-</td>
                          </tr>
                        ))}
                        {expensesByCategory.map((cat) => (
                          <tr key={cat.name} className="border-b">
                            <td className="py-2">{cat.name}</td>
                            <td className="py-2 text-right">-</td>
                            <td className="py-2 text-right text-expense">{formatCurrency(cat.amount)}</td>
                          </tr>
                        ))}
                        <tr className="font-bold">
                          <td className="py-2">TOTAL</td>
                          <td className="py-2 text-right text-income">{formatCurrency(totalIncome)}</td>
                          <td className="py-2 text-right text-expense">{formatCurrency(totalExpenses)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Trend Chart - Hidden on print, show summary instead */}
          <Card className="print:hidden">
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
                        formatCurrency(value),
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

          {/* Print-only: 6-month trend table */}
          <div className="hidden print:block mt-8">
            <h3 className="font-semibold mb-4">6-Month Trend Summary</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Month</th>
                  <th className="py-2 text-right">Income</th>
                  <th className="py-2 text-right">Expenses</th>
                  <th className="py-2 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month) => (
                  <tr key={month.month} className="border-b">
                    <td className="py-2">{month.month}</td>
                    <td className="py-2 text-right text-income">{formatCurrency(month.income)}</td>
                    <td className="py-2 text-right text-expense">{formatCurrency(month.expenses)}</td>
                    <td className={cn(
                      "py-2 text-right font-medium",
                      month.income - month.expenses >= 0 ? "text-income" : "text-expense"
                    )}>
                      {formatCurrency(month.income - month.expenses)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer for print */}
          <ReportFooter />
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;

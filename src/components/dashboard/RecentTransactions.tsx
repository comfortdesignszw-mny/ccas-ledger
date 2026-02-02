import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types';
import { useChurchSettings } from '@/contexts/ChurchSettingsContext';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { formatCurrency } = useChurchSettings();
  
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Recent Transactions
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/transactions">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {transactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className={cn(
                'flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50',
                'animate-slide-up'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    transaction.type === 'income'
                      ? 'bg-income/10 text-income'
                      : 'bg-expense/10 text-expense'
                  )}
                >
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.category?.name} •{' '}
                    {format(new Date(transaction.transactionDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    'font-semibold',
                    transaction.type === 'income'
                      ? 'text-income'
                      : 'text-expense'
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs capitalize text-muted-foreground">
                  {transaction.paymentMethod.replace('_', ' ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

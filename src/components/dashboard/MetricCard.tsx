import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useChurchSettings } from '@/contexts/ChurchSettingsContext';

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  variant?: 'default' | 'income' | 'expense' | 'balance';
  isCurrency?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon: Icon,
  variant = 'default',
  isCurrency = true,
}: MetricCardProps) {
  const { formatCurrency } = useChurchSettings();
  const isPositiveChange = change !== undefined && change > 0;
  const isNegativeChange = change !== undefined && change < 0;
  const isNoChange = change !== undefined && change === 0;

  const variantClasses = {
    default: 'metric-card',
    income: 'metric-card-income',
    expense: 'metric-card-expense',
    balance: 'metric-card-balance',
  };

  const iconBgClasses = {
    default: 'bg-muted text-muted-foreground',
    income: 'bg-income/10 text-income',
    expense: 'bg-expense/10 text-expense',
    balance: 'bg-primary/10 text-primary',
  };

  return (
    <div className={cn(variantClasses[variant], 'animate-fade-in')}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">
            {isCurrency ? formatCurrency(value) : value.toLocaleString()}
          </p>
        </div>
        <div className={cn('rounded-lg p-2.5', iconBgClasses[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              isPositiveChange && 'bg-income/10 text-income',
              isNegativeChange && 'bg-expense/10 text-expense',
              isNoChange && 'bg-muted text-muted-foreground'
            )}
          >
            {isPositiveChange && <TrendingUp className="h-3 w-3" />}
            {isNegativeChange && <TrendingDown className="h-3 w-3" />}
            {isNoChange && <Minus className="h-3 w-3" />}
            <span>
              {isPositiveChange && '+'}
              {change.toFixed(1)}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { categories } from '@/data/mockData';
import { cn } from '@/lib/utils';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1, 'Please select a category'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  transactionDate: z.date(),
  paymentMethod: z.enum(['cash', 'bank', 'mobile_money']),
  description: z.string().min(3, 'Description must be at least 3 characters').max(200, 'Description must be less than 200 characters'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  defaultValues?: Partial<TransactionFormData>;
}

export function TransactionForm({ onSubmit, defaultValues }: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    defaultValues?.type || 'income'
  );

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'income',
      categoryId: '',
      amount: 0,
      transactionDate: new Date(),
      paymentMethod: 'cash',
      description: '',
      ...defaultValues,
    },
  });

  const filteredCategories = categories.filter(
    (cat) => cat.type === transactionType
  );

  const handleTypeChange = (type: 'income' | 'expense') => {
    setTransactionType(type);
    form.setValue('type', type);
    form.setValue('categoryId', ''); // Reset category when type changes
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Transaction Type Toggle */}
        <div className="flex rounded-lg border p-1">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={cn(
              'flex-1 rounded-md py-2 text-sm font-medium transition-all',
              transactionType === 'income'
                ? 'bg-income text-income-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={cn(
              'flex-1 rounded-md py-2 text-sm font-medium transition-all',
              transactionType === 'expense'
                ? 'bg-expense text-expense-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Expense
          </button>
        </div>

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (KES)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  {...field}
                  className="text-lg font-medium"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="transactionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Method */}
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter transaction details"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1">
            Save Transaction
          </Button>
        </div>
      </form>
    </Form>
  );
}

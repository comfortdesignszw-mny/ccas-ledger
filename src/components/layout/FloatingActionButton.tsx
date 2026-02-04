import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function FloatingActionButton({ 
  onClick, 
  label = 'Add Transaction',
  className 
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-50 h-14 gap-2 rounded-full px-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl md:bottom-8 md:right-8',
        className
      )}
      size="lg"
    >
      <Plus className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

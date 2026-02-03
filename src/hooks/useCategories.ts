import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  description: string | null;
  created_at: string;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCategoriesByType(type: 'income' | 'expense') {
  const { data: categories, ...rest } = useCategories();
  
  return {
    ...rest,
    data: categories?.filter(cat => cat.type === type) || [],
  };
}

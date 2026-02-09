import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Asset {
  id: string;
  name: string;
  category: string;
  serial_number: string | null;
  location: string | null;
  purchase_date: string | null;
  purchase_value: number;
  status: 'active' | 'damaged' | 'sold';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AssetInput {
  name: string;
  category: string;
  serial_number?: string;
  location?: string;
  purchase_date?: string;
  purchase_value: number;
  status?: 'active' | 'damaged' | 'sold';
}

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async (): Promise<Asset[]> => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AssetInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in');
      const { data, error } = await supabase
        .from('assets')
        .insert({ ...input, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add asset');
    },
  });
}

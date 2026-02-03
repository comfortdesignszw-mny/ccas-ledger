import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AppRole = 'admin' | 'finance_officer' | 'leader' | 'auditor';
export type UserStatus = 'active' | 'disabled';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  role?: AppRole;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: AppRole;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserProfile[]> => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      return (profiles || []).map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.user_id)?.role as AppRole | undefined,
      }));
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: UserStatus }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user status');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete from profiles (user_roles will cascade)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
}

// Role descriptions for UI
export const roleDescriptions: Record<AppRole, string> = {
  admin: 'Full system access',
  finance_officer: 'Manage transactions & reports',
  leader: 'View reports only',
  auditor: 'Read-only access',
};

export const roleColors: Record<AppRole, string> = {
  admin: 'bg-primary/10 text-primary',
  finance_officer: 'bg-income/10 text-income',
  leader: 'bg-info/10 text-info',
  auditor: 'bg-warning/10 text-warning',
};

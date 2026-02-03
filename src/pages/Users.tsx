import { useState } from 'react';
import { Shield, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserDialog } from '@/components/users/UserDialog';
import { 
  useUsers, 
  useUpdateUserStatus, 
  useDeleteUser,
  roleDescriptions, 
  roleColors,
  type AppRole 
} from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const Users = () => {
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

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

  const handleToggleStatus = (userId: string, currentStatus: 'active' | 'disabled') => {
    updateStatus.mutate({
      userId,
      status: currentStatus === 'active' ? 'disabled' : 'active',
    });
  };

  const handleDeleteClick = (userId: string) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUserId) {
      deleteUser.mutate(selectedUserId);
    }
    setDeleteDialogOpen(false);
    setSelectedUserId(null);
  };

  const roles: AppRole[] = ['admin', 'finance_officer', 'leader', 'auditor'];

  return (
    <AppLayout>
      <Header
        title="User Management"
        subtitle="Manage system users and permissions"
        showAddButton
        addButtonLabel="Add User"
        onAddClick={() => setUserDialogOpen(true)}
      />

      <div className="page-container">
        {/* Role Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          {roles.map((role) => (
            <Card key={role}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-lg p-2.5', roleColors[role])}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm capitalize text-muted-foreground">
                      {role.replace('_', ' ')}
                    </p>
                    <p className="text-2xl font-bold">
                      {users.filter((u) => u.role === role).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5}>
                      <Skeleton className="h-16 w-full" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found. Click "Add User" to create the first user.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {user.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {user.role ? (
                          <div className="space-y-1">
                            <span
                              className={cn(
                                'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                roleColors[user.role]
                              )}
                            >
                              {user.role.replace('_', ' ')}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {roleDescriptions[user.role]}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No role assigned</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            user.status === 'active'
                              ? 'bg-income/10 text-income'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {user.status === 'active' ? (
                            <UserCheck className="h-3 w-3" />
                          ) : (
                            <UserX className="h-3 w-3" />
                          )}
                          {user.status}
                        </span>
                      </td>
                      <td className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" /> Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => handleToggleStatus(user.user_id, user.status)}
                            >
                              {user.status === 'active' ? (
                                <>
                                  <UserX className="h-4 w-4" /> Disable
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4" /> Enable
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={() => handleDeleteClick(user.user_id)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UserDialog open={userDialogOpen} onOpenChange={setUserDialogOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Users;

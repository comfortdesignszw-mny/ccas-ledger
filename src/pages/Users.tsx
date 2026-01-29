import { Users as UsersIcon, Shield, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
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
import { cn } from '@/lib/utils';

const users = [
  {
    id: '1',
    fullName: 'John Mwangi',
    email: 'john.mwangi@church.org',
    role: 'admin',
    status: 'active',
    lastActive: new Date('2025-01-29'),
  },
  {
    id: '2',
    fullName: 'Grace Wanjiku',
    email: 'grace.wanjiku@church.org',
    role: 'finance_officer',
    status: 'active',
    lastActive: new Date('2025-01-28'),
  },
  {
    id: '3',
    fullName: 'Pastor David Omondi',
    email: 'pastor.david@church.org',
    role: 'leader',
    status: 'active',
    lastActive: new Date('2025-01-27'),
  },
  {
    id: '4',
    fullName: 'Sarah Kimani',
    email: 'sarah.kimani@church.org',
    role: 'auditor',
    status: 'active',
    lastActive: new Date('2025-01-15'),
  },
  {
    id: '5',
    fullName: 'Michael Otieno',
    email: 'michael.otieno@church.org',
    role: 'finance_officer',
    status: 'disabled',
    lastActive: new Date('2024-12-20'),
  },
];

const roleDescriptions = {
  admin: 'Full system access',
  finance_officer: 'Manage transactions & reports',
  leader: 'View reports only',
  auditor: 'Read-only access',
};

const roleColors = {
  admin: 'bg-primary/10 text-primary',
  finance_officer: 'bg-income/10 text-income',
  leader: 'bg-info/10 text-info',
  auditor: 'bg-warning/10 text-warning',
};

const Users = () => {
  return (
    <AppLayout>
      <Header
        title="User Management"
        subtitle="Manage system users and permissions"
        showAddButton
        addButtonLabel="Add User"
      />

      <div className="page-container">
        {/* Role Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          {(['admin', 'finance_officer', 'leader', 'auditor'] as const).map(
            (role) => (
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
            )
          )}
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
                  <th>Last Active</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {user.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <span
                          className={cn(
                            'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                            roleColors[user.role as keyof typeof roleColors]
                          )}
                        >
                          {user.role.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {roleDescriptions[user.role as keyof typeof roleDescriptions]}
                        </p>
                      </div>
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
                      {user.lastActive.toLocaleDateString('en-US', {
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
                          <DropdownMenuItem className="gap-2">
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
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Users;

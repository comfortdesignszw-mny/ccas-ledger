import { useState } from 'react';
import { Package, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChurchSettings } from '@/contexts/ChurchSettingsContext';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { cn } from '@/lib/utils';

type AssetStatus = 'active' | 'damaged' | 'sold';

interface Asset {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  location: string;
  purchaseDate: Date;
  purchaseValue: number;
  status: AssetStatus;
}

// Placeholder - will be replaced with database when assets table is created
const assets: Asset[] = [];

const Assets = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { formatCurrency } = useChurchSettings();
  const { isAuthenticated, loading: authLoading } = useAuth();

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

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || asset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = assets
    .filter((a) => a.status === 'active')
    .reduce((sum, a) => sum + a.purchaseValue, 0);

  const statusCounts = {
    active: assets.filter((a) => a.status === 'active').length,
    damaged: assets.filter((a) => a.status === 'damaged').length,
    sold: assets.filter((a) => a.status === 'sold').length,
  };

  return (
    <AppLayout>
      <Header
        title="Assets Register"
        subtitle="Track and manage church property"
        showAddButton
        addButtonLabel="Add Asset"
      />

      <div className="page-container">
        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="text-2xl font-bold">{assets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Active Assets</p>
              <p className="text-2xl font-bold text-income">
                {statusCounts.active}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Damaged</p>
              <p className="text-2xl font-bold text-expense">
                {statusCounts.damaged}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assets Grid */}
        {filteredAssets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} formatCurrency={formatCurrency} />
            ))}
          </div>
        ) : (
          <div className="empty-state mt-8">
            <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No assets found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Add Asset" to register your first church asset
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

function AssetCard({ asset, formatCurrency }: { asset: Asset; formatCurrency: (amount: number) => string }) {
  const statusStyles = {
    active: 'bg-income/10 text-income',
    damaged: 'bg-expense/10 text-expense',
    sold: 'bg-muted text-muted-foreground',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{asset.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{asset.category}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <Eye className="h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Edit className="h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive">
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Serial No.</span>
          <span className="font-mono text-xs">{asset.serialNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Location</span>
          <span>{asset.location}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Purchase Value</span>
          <span className="font-medium">
            {formatCurrency(asset.purchaseValue)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
              statusStyles[asset.status]
            )}
          >
            {asset.status}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default Assets;

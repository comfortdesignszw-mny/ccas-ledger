import { useState, useEffect, useRef } from 'react';
import { Building2, Bell, Lock, Database, Download, Globe, Upload, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChurchSettings } from '@/contexts/ChurchSettingsContext';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { CURRENCY_LIST, CurrencyCode } from '@/types/currency';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { settings, updateChurchInfo, updateCurrency, updateSettings, getCurrency } = useChurchSettings();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [churchName, setChurchName] = useState(settings.churchInfo.name);
  const [churchAddress, setChurchAddress] = useState(settings.churchInfo.address);
  const [churchPhone, setChurchPhone] = useState(settings.churchInfo.phone);
  const [churchEmail, setChurchEmail] = useState(settings.churchInfo.email);
  const [churchMotto, setChurchMotto] = useState(settings.churchInfo.motto || '');
  const [logoUrl, setLogoUrl] = useState(settings.churchInfo.logo || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state when settings change
  useEffect(() => {
    setChurchName(settings.churchInfo.name);
    setChurchAddress(settings.churchInfo.address);
    setChurchPhone(settings.churchInfo.phone);
    setChurchEmail(settings.churchInfo.email);
    setChurchMotto(settings.churchInfo.motto || '');
    setLogoUrl(settings.churchInfo.logo || '');
  }, [settings.churchInfo]);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `logo-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('church-logos')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('church-logos')
        .getPublicUrl(filePath);
      setLogoUrl(publicUrl);
      toast.success('Logo uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
  };

  const handleSaveChurchInfo = () => {
    updateChurchInfo({
      name: churchName,
      address: churchAddress,
      phone: churchPhone,
      email: churchEmail,
      motto: churchMotto,
      logo: logoUrl || undefined,
    });
    toast.success('Church information saved successfully!');
  };

  const handleCurrencyChange = (currency: CurrencyCode) => {
    updateCurrency(currency);
    toast.success(`Currency changed to ${CURRENCY_LIST.find(c => c.code === currency)?.name}`);
  };

  const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
    updateSettings({
      notifications: { ...settings.notifications, [key]: value },
    });
  };

  const handleSecurityChange = (key: keyof typeof settings.security, value: boolean) => {
    updateSettings({
      security: { ...settings.security, [key]: value },
    });
  };

  const currentCurrency = getCurrency();

  return (
    <AppLayout>
      <Header title="Settings" subtitle="Configure system preferences" />

      <div className="page-container">
        <div className="max-w-3xl space-y-6">
          {/* Currency Settings */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Currency Settings
              </CardTitle>
              <CardDescription>
                Set the default currency for all financial transactions and reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select value={settings.currency} onValueChange={(value: CurrencyCode) => handleCurrencyChange(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_LIST.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-muted-foreground">{currency.symbol}</span>
                          <span>{currency.name}</span>
                          <span className="text-xs text-muted-foreground">({currency.code})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Current: {currentCurrency.name} ({currentCurrency.symbol})
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Church Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Church Information
              </CardTitle>
              <CardDescription>
                This information appears on report letterheads and official documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="churchName">Church Name</Label>
                  <Input 
                    id="churchName" 
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motto">Church Motto</Label>
                  <Input 
                    id="motto" 
                    value={churchMotto}
                    onChange={(e) => setChurchMotto(e.target.value)}
                    placeholder="Optional tagline or motto"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={churchAddress}
                  onChange={(e) => setChurchAddress(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={churchPhone}
                    onChange={(e) => setChurchPhone(e.target.value)}
                    type="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    value={churchEmail}
                    onChange={(e) => setChurchEmail(e.target.value)}
                    type="email"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Church Logo</Label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <div className="relative">
                      <img
                        src={logoUrl}
                        alt="Church logo"
                        className="h-16 w-16 rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
                      <Building2 className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )}
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Max 2MB, JPG/PNG</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveChurchInfo}>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Large Transaction Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified for transactions above threshold
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.largeTransactionAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('largeTransactionAlerts', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Monthly Report Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Reminder to generate monthly financial reports
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.monthlyReportReminders}
                  onCheckedChange={(checked) => handleNotificationChange('monthlyReportReminders', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Backup Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Weekly reminder to backup your data
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.backupReminders}
                  onCheckedChange={(checked) => handleNotificationChange('backupReminders', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage security settings and access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require 2FA for Admins</p>
                  <p className="text-sm text-muted-foreground">
                    Two-factor authentication for admin accounts
                  </p>
                </div>
                <Switch 
                  checked={settings.security.require2FA}
                  onCheckedChange={(checked) => handleSecurityChange('require2FA', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">
                    Auto logout after 30 minutes of inactivity
                  </p>
                </div>
                <Switch 
                  checked={settings.security.sessionTimeout}
                  onCheckedChange={(checked) => handleSecurityChange('sessionTimeout', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audit Logging</p>
                  <p className="text-sm text-muted-foreground">
                    Track all user actions for accountability
                  </p>
                </div>
                <Switch 
                  checked={settings.security.auditLogging}
                  onCheckedChange={(checked) => handleSecurityChange('auditLogging', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Backup and export your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Export All Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download all transactions, reports, and settings
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Create Backup</p>
                  <p className="text-sm text-muted-foreground">
                    Last backup: Never
                  </p>
                </div>
                <Button className="gap-2">
                  <Database className="h-4 w-4" />
                  Backup Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Offline Mode */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">🌍 Offline-First Support</CardTitle>
              <CardDescription>
                This system is optimized for rural churches with limited internet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-income"></span>
                  Data syncs automatically when connection is available
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-income"></span>
                  All transactions are saved locally first
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-income"></span>
                  Reports can be generated offline
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;

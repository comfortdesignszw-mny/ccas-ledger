
-- Church settings table (single row for the organization)
CREATE TABLE public.church_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Grace Community Church',
  address text NOT NULL DEFAULT '123 Faith Avenue, City',
  phone text NOT NULL DEFAULT '+1 234 567 8900',
  email text NOT NULL DEFAULT 'info@gracechurch.org',
  motto text,
  logo text,
  currency text NOT NULL DEFAULT 'USD',
  notifications jsonb NOT NULL DEFAULT '{"largeTransactionAlerts":true,"monthlyReportReminders":true,"backupReminders":true}',
  security jsonb NOT NULL DEFAULT '{"require2FA":false,"sessionTimeout":true,"auditLogging":true}',
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.church_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view settings
CREATE POLICY "All authenticated can view church settings"
  ON public.church_settings FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update church settings"
  ON public.church_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert settings
CREATE POLICY "Admins can insert church settings"
  ON public.church_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_church_settings_updated_at
  BEFORE UPDATE ON public.church_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row
INSERT INTO public.church_settings (name, address, phone, email, motto, currency)
VALUES ('Grace Community Church', '123 Faith Avenue, City', '+1 234 567 8900', 'info@gracechurch.org', 'Building Faith, Serving Community', 'USD');

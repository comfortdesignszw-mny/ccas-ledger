
-- Create asset_status enum
CREATE TYPE public.asset_status AS ENUM ('active', 'damaged', 'sold');

-- Create event_status enum
CREATE TYPE public.event_status AS ENUM ('upcoming', 'completed', 'cancelled');

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  status event_status NOT NULL DEFAULT 'upcoming',
  expected_per_member NUMERIC NOT NULL DEFAULT 0,
  total_members INTEGER NOT NULL DEFAULT 0,
  collected NUMERIC NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  serial_number TEXT,
  location TEXT,
  purchase_date DATE,
  purchase_value NUMERIC NOT NULL DEFAULT 0,
  status asset_status NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Events RLS policies
CREATE POLICY "All authenticated can view events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Admins and finance officers can insert events"
  ON public.events FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance_officer'::app_role));

CREATE POLICY "Admins and finance officers can update events"
  ON public.events FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance_officer'::app_role));

CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Assets RLS policies
CREATE POLICY "All authenticated can view assets"
  ON public.assets FOR SELECT
  USING (true);

CREATE POLICY "Admins and finance officers can insert assets"
  ON public.assets FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance_officer'::app_role));

CREATE POLICY "Admins and finance officers can update assets"
  ON public.assets FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance_officer'::app_role));

CREATE POLICY "Admins can delete assets"
  ON public.assets FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Timestamps triggers
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

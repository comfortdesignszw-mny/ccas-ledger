-- Add event_id column to transactions for reliable event-based filtering and reporting
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS event_id uuid NULL REFERENCES public.events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_event_id
  ON public.transactions(event_id);

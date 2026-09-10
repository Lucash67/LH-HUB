-- Programa de Fidelidade Semanal (Salgados / OMNI Business)
-- Incremental e não destrutivo.

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS loyalty_confirmed BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_sales_loyalty_confirmed
  ON public.sales (business_id, loyalty_confirmed)
  WHERE loyalty_confirmed = true;

CREATE TABLE IF NOT EXISTS public.loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  week_start_day SMALLINT NOT NULL DEFAULT 1 CHECK (week_start_day BETWEEN 0 AND 6),
  week_end_day SMALLINT NOT NULL DEFAULT 5 CHECK (week_end_day BETWEEN 0 AND 6),
  total_units_required INTEGER NOT NULL DEFAULT 6 CHECK (total_units_required > 0),
  max_rewards_per_week INTEGER NOT NULL DEFAULT 1 CHECK (max_rewards_per_week > 0),
  reward_quantity INTEGER NOT NULL DEFAULT 1 CHECK (reward_quantity > 0),
  reward_product_rule TEXT NOT NULL DEFAULT 'any_eligible'
    CHECK (reward_product_rule IN ('any_eligible', 'same_as_purchase', 'fixed_product')),
  fixed_reward_product_id UUID REFERENCES public.products (id) ON DELETE SET NULL,
  all_products_eligible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_programs_business_name
  ON public.loyalty_programs (business_id, name);

CREATE INDEX IF NOT EXISTS idx_loyalty_programs_business_active
  ON public.loyalty_programs (business_id, active);

CREATE TABLE IF NOT EXISTS public.loyalty_program_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.loyalty_programs (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (program_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.loyalty_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.loyalty_programs (id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (program_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_participants_program_active
  ON public.loyalty_participants (program_id, active);

CREATE INDEX IF NOT EXISTS idx_loyalty_participants_client
  ON public.loyalty_participants (client_id);

CREATE TABLE IF NOT EXISTS public.loyalty_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.loyalty_programs (id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_units INTEGER NOT NULL DEFAULT 0 CHECK (total_units >= 0),
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN (
      'not_started',
      'in_progress',
      'almost_there',
      'completed',
      'reward_available',
      'reward_scheduled',
      'reward_delivered',
      'week_closed_incomplete'
    )),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (program_id, client_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_weeks_program_week
  ON public.loyalty_weeks (program_id, week_start);

CREATE INDEX IF NOT EXISTS idx_loyalty_weeks_client
  ON public.loyalty_weeks (client_id, week_start DESC);

CREATE TABLE IF NOT EXISTS public.loyalty_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_week_id UUID NOT NULL REFERENCES public.loyalty_weeks (id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.loyalty_programs (id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  sale_id UUID REFERENCES public.sales (id) ON DELETE SET NULL,
  entry_date DATE NOT NULL,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  quantity INTEGER NOT NULL CHECK (quantity <> 0),
  entry_type TEXT NOT NULL
    CHECK (entry_type IN ('purchase', 'reversal', 'adjustment')),
  description TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES public.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_entries_purchase_sale_unique
  ON public.loyalty_entries (program_id, sale_id)
  WHERE sale_id IS NOT NULL AND entry_type = 'purchase';

CREATE INDEX IF NOT EXISTS idx_loyalty_entries_week
  ON public.loyalty_entries (loyalty_week_id, entry_date);

CREATE INDEX IF NOT EXISTS idx_loyalty_entries_client_date
  ON public.loyalty_entries (client_id, entry_date);

CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_week_id UUID NOT NULL REFERENCES public.loyalty_weeks (id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.loyalty_programs (id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'scheduled', 'delivered', 'cancelled', 'invalidated')),
  product_id UUID REFERENCES public.products (id) ON DELETE SET NULL,
  scheduled_for DATE,
  observation TEXT,
  delivery_sale_id UUID REFERENCES public.sales (id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users (id) ON DELETE SET NULL,
  delivered_by UUID REFERENCES public.users (id) ON DELETE SET NULL,
  delivered_at TIMESTAMPTZ,
  invalidated_at TIMESTAMPTZ,
  invalidation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_week
  ON public.loyalty_rewards (loyalty_week_id);

CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_status
  ON public.loyalty_rewards (program_id, status);

CREATE TABLE IF NOT EXISTS public.loyalty_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.loyalty_programs (id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients (id) ON DELETE SET NULL,
  loyalty_week_id UUID REFERENCES public.loyalty_weeks (id) ON DELETE SET NULL,
  loyalty_entry_id UUID REFERENCES public.loyalty_entries (id) ON DELETE SET NULL,
  loyalty_reward_id UUID REFERENCES public.loyalty_rewards (id) ON DELETE SET NULL,
  sale_id UUID REFERENCES public.sales (id) ON DELETE SET NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN (
      'purchase_confirmed',
      'sale_cancelled',
      'progress_updated',
      'goal_completed',
      'reward_created',
      'reward_scheduled',
      'reward_delivered',
      'reward_cancelled',
      'reward_invalidated',
      'manual_adjustment',
      'reversal',
      'participant_joined',
      'participant_left',
      'week_closed'
    )),
  quantity INTEGER,
  description TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_events_program_created
  ON public.loyalty_events (program_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_loyalty_events_client
  ON public.loyalty_events (client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_loyalty_events_week
  ON public.loyalty_events (loyalty_week_id, created_at DESC);

-- Seed: programa semanal Salgados (business UUID canônico)
INSERT INTO public.loyalty_programs (
  id,
  business_id,
  name,
  active,
  week_start_day,
  week_end_day,
  total_units_required,
  max_rewards_per_week,
  reward_quantity,
  reward_product_rule,
  all_products_eligible
)
VALUES (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  'Fidelidade Semanal Salgados',
  true,
  1,
  5,
  6,
  1,
  1,
  'any_eligible',
  true
)
ON CONFLICT (id) DO NOTHING;

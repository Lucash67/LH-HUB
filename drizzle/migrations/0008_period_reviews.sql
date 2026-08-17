-- Retratos semanais/mensais (leitura interpretativa persistida).

CREATE TABLE IF NOT EXISTS public.period_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
  period_key TEXT NOT NULL,
  range_start DATE NOT NULL,
  range_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  title TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  causes JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  channel_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  metrics_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  body_md TEXT NOT NULL DEFAULT '',
  fair_reading TEXT NOT NULL DEFAULT '',
  next_goals TEXT NOT NULL DEFAULT '',
  schema_version INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT period_reviews_business_period_unique UNIQUE (business_id, period_type, period_key)
);

CREATE INDEX IF NOT EXISTS idx_period_reviews_business_type_start
  ON public.period_reviews (business_id, period_type, range_start DESC);

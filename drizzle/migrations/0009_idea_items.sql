-- Ideias / demandas / observações futuras — escopo por usuário (owner_id).

CREATE TABLE IF NOT EXISTS public.idea_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses (id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'ideia'
    CHECK (kind IN ('ideia', 'demanda', 'observacao')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'done', 'archived')),
  pinned BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_idea_items_owner
  ON public.idea_items (owner_id);

CREATE INDEX IF NOT EXISTS idx_idea_items_owner_status
  ON public.idea_items (owner_id, status);

CREATE INDEX IF NOT EXISTS idx_idea_items_owner_updated
  ON public.idea_items (owner_id, updated_at DESC);

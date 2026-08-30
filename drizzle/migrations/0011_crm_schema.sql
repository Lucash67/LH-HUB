-- OMNI CRM — schema isolado (não toca public.* do Business nem schedule.*).
-- Additive only. Freela sites/softwares — pipeline de conversão.

CREATE SCHEMA IF NOT EXISTS crm;

CREATE TABLE IF NOT EXISTS crm.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Fortaleza',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_workspaces_slug
  ON crm.workspaces (slug);

CREATE TABLE IF NOT EXISTS crm.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES crm.workspaces (id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_ws_members_ws_user
  ON crm.workspace_members (workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_crm_ws_members_user
  ON crm.workspace_members (user_id);

CREATE TABLE IF NOT EXISTS crm.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES crm.workspaces (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  contact_type TEXT NOT NULL DEFAULT 'lead',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_ws
  ON crm.contacts (workspace_id);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_name
  ON crm.contacts (workspace_id, name);

CREATE TABLE IF NOT EXISTS crm.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES crm.workspaces (id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_won BOOLEAN NOT NULL DEFAULT false,
  is_lost BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_stages_ws_slug
  ON crm.pipeline_stages (workspace_id, slug);

CREATE INDEX IF NOT EXISTS idx_crm_stages_ws_sort
  ON crm.pipeline_stages (workspace_id, sort_order);

CREATE TABLE IF NOT EXISTS crm.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES crm.workspaces (id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm.contacts (id) ON DELETE SET NULL,
  stage_id UUID NOT NULL REFERENCES crm.pipeline_stages (id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  source TEXT,
  notes TEXT,
  expected_close DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_deals_ws
  ON crm.deals (workspace_id);

CREATE INDEX IF NOT EXISTS idx_crm_deals_stage
  ON crm.deals (stage_id);

CREATE INDEX IF NOT EXISTS idx_crm_deals_contact
  ON crm.deals (contact_id);

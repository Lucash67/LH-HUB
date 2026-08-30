-- OMNI CRM — rascunhos / pitchs agendados (envio manual).
-- Additive only. Schema crm.* isolado.

CREATE TABLE IF NOT EXISTS crm.message_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES crm.workspaces (id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm.contacts (id) ON DELETE SET NULL,
  deal_id UUID REFERENCES crm.deals (id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'pitch_inicial',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_messages_ws_when
  ON crm.message_drafts (workspace_id, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_crm_messages_ws_status
  ON crm.message_drafts (workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_crm_messages_contact
  ON crm.message_drafts (contact_id);

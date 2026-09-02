-- OMNI CRM — notas rápidas (isoladas de public.sticky_notes).
-- Additive only. Schema crm.* isolado.

CREATE TABLE IF NOT EXISTS crm.sticky_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES crm.workspaces (id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'default',
  note_date DATE,
  pinned BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  client_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_notes_ws_user
  ON crm.sticky_notes (workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_crm_notes_ws_user_archived
  ON crm.sticky_notes (workspace_id, user_id, archived);

CREATE INDEX IF NOT EXISTS idx_crm_notes_ws_user_updated
  ON crm.sticky_notes (workspace_id, user_id, client_updated_at);

CREATE INDEX IF NOT EXISTS idx_crm_notes_ws_user_date
  ON crm.sticky_notes (workspace_id, user_id, note_date);

-- OMNI CRM — link do serviço/site de cada negócio.
-- Additive only. Schema crm.* isolado.

ALTER TABLE crm.deals
  ADD COLUMN IF NOT EXISTS service_url TEXT;

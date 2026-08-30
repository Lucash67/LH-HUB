-- OMNI CRM — temperatura do negócio (alerta / quente / morno / frio / …).
-- Additive only. Schema crm.* isolado.

ALTER TABLE crm.deals
  ADD COLUMN IF NOT EXISTS temperature TEXT NOT NULL DEFAULT 'neutral';

CREATE INDEX IF NOT EXISTS idx_crm_deals_temperature
  ON crm.deals (workspace_id, temperature);

UPDATE crm.deals d
SET temperature = CASE
  WHEN s.slug = 'won' THEN 'won'
  WHEN s.slug = 'lost' THEN 'lost'
  WHEN s.slug = 'lead' THEN 'cold'
  WHEN s.slug = 'qualified' THEN 'warm'
  WHEN s.slug = 'negotiation' AND d.value >= 3000 THEN 'alert'
  WHEN s.slug = 'negotiation' THEN 'hot'
  ELSE 'neutral'
END
FROM crm.pipeline_stages s
WHERE s.id = d.stage_id;

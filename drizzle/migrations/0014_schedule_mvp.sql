-- OMNI Schedule MVP — evolução de schedule.* (NÃO reaplicar 0010).
-- Additive. Tabelas vazias no apply inicial.
--
-- Herança de horários (não copiar org → profissional):
--   profissional sem working_hours próprios → herda organization_working_hours
--   profissional com working_hours próprios → override

-- 1. organizations — onboarding + página pública
ALTER TABLE schedule.organizations
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- 2. customers — anti-duplicidade de telefone por organização
DROP INDEX IF EXISTS idx_sch_customers_org_phone;
CREATE UNIQUE INDEX IF NOT EXISTS idx_sch_customers_org_phone_unique
  ON schedule.customers (organization_id, phone);

-- 3. appointment_services — N serviços por atendimento (snapshots)
CREATE TABLE IF NOT EXISTS schedule.appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES schedule.organizations (id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES schedule.appointments (id) ON DELETE CASCADE,
  service_id UUID REFERENCES schedule.services (id) ON DELETE SET NULL,
  service_name_snapshot TEXT NOT NULL,
  duration_minutes_snapshot INTEGER NOT NULL,
  price_snapshot NUMERIC(12, 2) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sch_appt_services_appt
  ON schedule.appointment_services (appointment_id);

CREATE INDEX IF NOT EXISTS idx_sch_appt_services_org
  ON schedule.appointment_services (organization_id);

-- 4. appointments — sai service_id único; entra token público
ALTER TABLE schedule.appointments
  DROP CONSTRAINT IF EXISTS appointments_service_id_fkey;

ALTER TABLE schedule.appointments
  DROP COLUMN IF EXISTS service_id;

ALTER TABLE schedule.appointments
  ADD COLUMN IF NOT EXISTS public_token UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS idx_sch_appointments_public_token
  ON schedule.appointments (public_token);

-- 5. horário semanal da organização (base; profissionais herdam se não tiverem o próprio)
CREATE TABLE IF NOT EXISTS schedule.organization_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES schedule.organizations (id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_sch_org_hours_org_weekday
  ON schedule.organization_working_hours (organization_id, weekday);

-- 6. exceções — org ou profissional; bloqueio ou disponibilidade extra
ALTER TABLE schedule.availability_exceptions
  ALTER COLUMN professional_id DROP NOT NULL;

ALTER TABLE schedule.availability_exceptions
  ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'professional',
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'unavailable';

ALTER TABLE schedule.availability_exceptions
  DROP COLUMN IF EXISTS is_unavailable;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sch_avail_exc_scope_check'
  ) THEN
    ALTER TABLE schedule.availability_exceptions
      ADD CONSTRAINT sch_avail_exc_scope_check
      CHECK (scope IN ('organization', 'professional'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sch_avail_exc_kind_check'
  ) THEN
    ALTER TABLE schedule.availability_exceptions
      ADD CONSTRAINT sch_avail_exc_kind_check
      CHECK (kind IN ('unavailable', 'available'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sch_avail_exc_scope_professional'
  ) THEN
    ALTER TABLE schedule.availability_exceptions
      ADD CONSTRAINT sch_avail_exc_scope_professional
      CHECK (
        (scope = 'professional' AND professional_id IS NOT NULL)
        OR (scope = 'organization' AND professional_id IS NULL)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sch_avail_exc_org_date
  ON schedule.availability_exceptions (organization_id, exception_date);

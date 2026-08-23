-- OMNI Schedule — schema isolado (não toca public.* do Business).
-- Additive only. Vertical = organizations.business_type (genérico).

CREATE SCHEMA IF NOT EXISTS schedule;

CREATE TABLE IF NOT EXISTS schedule.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  business_type TEXT NOT NULL DEFAULT 'barber_shop',
  timezone TEXT NOT NULL DEFAULT 'America/Fortaleza',
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sch_organizations_slug
  ON schedule.organizations (slug);

CREATE TABLE IF NOT EXISTS schedule.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES schedule.organizations (id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sch_org_members_org_user
  ON schedule.organization_members (organization_id, user_id);

CREATE INDEX IF NOT EXISTS idx_sch_org_members_user
  ON schedule.organization_members (user_id);

CREATE TABLE IF NOT EXISTS schedule.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES schedule.organizations (id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sch_professionals_org
  ON schedule.professionals (organization_id);

CREATE TABLE IF NOT EXISTS schedule.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES schedule.organizations (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sch_services_org
  ON schedule.services (organization_id);

CREATE TABLE IF NOT EXISTS schedule.professional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES schedule.organizations (id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES schedule.professionals (id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES schedule.services (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sch_prof_services_uniq
  ON schedule.professional_services (professional_id, service_id);

CREATE TABLE IF NOT EXISTS schedule.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES schedule.organizations (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sch_customers_org
  ON schedule.customers (organization_id);

CREATE INDEX IF NOT EXISTS idx_sch_customers_org_phone
  ON schedule.customers (organization_id, phone);

CREATE TABLE IF NOT EXISTS schedule.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES schedule.organizations (id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES schedule.professionals (id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sch_working_hours_prof_weekday
  ON schedule.working_hours (professional_id, weekday);

CREATE TABLE IF NOT EXISTS schedule.availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES schedule.organizations (id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES schedule.professionals (id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_unavailable BOOLEAN NOT NULL DEFAULT true,
  reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_sch_avail_exc_prof_date
  ON schedule.availability_exceptions (professional_id, exception_date);

CREATE TABLE IF NOT EXISTS schedule.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES schedule.organizations (id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES schedule.customers (id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES schedule.professionals (id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES schedule.services (id) ON DELETE RESTRICT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  price NUMERIC(12, 2) NOT NULL,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'dashboard'
    CHECK (source IN ('dashboard', 'public_booking')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_at > start_at)
);

CREATE INDEX IF NOT EXISTS idx_sch_appointments_org_start
  ON schedule.appointments (organization_id, start_at);

CREATE INDEX IF NOT EXISTS idx_sch_appointments_prof_start
  ON schedule.appointments (professional_id, start_at);

CREATE INDEX IF NOT EXISTS idx_sch_appointments_status
  ON schedule.appointments (organization_id, status);

-- Anti double-booking no banco (excluindo cancelados / no_show).
CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sch_appointments_no_overlap'
  ) THEN
    ALTER TABLE schedule.appointments
      ADD CONSTRAINT sch_appointments_no_overlap
      EXCLUDE USING gist (
        professional_id WITH =,
        tstzrange(start_at, end_at, '[)') WITH &&
      )
      WHERE (status NOT IN ('cancelled', 'no_show'));
  END IF;
END $$;

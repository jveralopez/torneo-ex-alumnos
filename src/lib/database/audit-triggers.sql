-- =============================================
-- AUDIT TRIGGERS (SERVER-SIDE / TRUSTED)
--
-- Goal: ensure audit_log is written by the DB, not the client.
-- - Uses a SECURITY DEFINER trigger function to write audit rows.
-- - Derives actor from JWT email claim and maps to admin_user.id.
-- - Prevents direct INSERT/UPDATE/DELETE on audit_log for client roles.
-- - Allows SELECT only for admins via RLS.
--
-- Run this in Supabase SQL Editor.
-- =============================================

-- 1) Ensure RLS is enabled
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 2) Lock down direct writes from client roles
REVOKE INSERT, UPDATE, DELETE ON TABLE public.audit_log FROM anon, authenticated;

-- 3) Allow reading audit logs only for active admins
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_log;
CREATE POLICY "Admins can read audit logs"
ON public.audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_user au
    WHERE au.email = (auth.jwt() ->> 'email')
      AND au.active = true
  )
);

-- 4) Helper: resolve admin_user_id from current JWT email
CREATE OR REPLACE FUNCTION public._audit_admin_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT au.id
  FROM public.admin_user au
  WHERE au.email = (auth.jwt() ->> 'email')
    AND au.active = true
  LIMIT 1;
$$;

-- 5) Main trigger function
CREATE OR REPLACE FUNCTION public.audit_log_row_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_record_id uuid;
  v_old jsonb;
  v_new jsonb;
  v_admin_user_id uuid;
BEGIN
  v_admin_user_id := public._audit_admin_user_id();

  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_record_id := NEW.id;
    v_old := NULL;
    v_new := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_record_id := NEW.id;
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_record_id := OLD.id;
    v_old := to_jsonb(OLD);
    v_new := NULL;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO public.audit_log (
    admin_user_id,
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    description
  ) VALUES (
    v_admin_user_id,
    TG_TABLE_NAME,
    v_record_id,
    v_action,
    v_old,
    v_new,
    NULL
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6) Attach triggers to core tables
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'team',
    'player',
    'match_day',
    'match',
    'goal',
    'card',
    'sanction',
    'document',
    'news',
    'tournament',
    'admin_user'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%I_change ON public.%I;', t, t);
    EXECUTE format(
      'CREATE TRIGGER audit_%I_change AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_log_row_change();',
      t,
      t
    );
  END LOOP;
END $$;

-- Notes:
-- - If you have tables with sensitive columns, consider stripping them from v_old/v_new.
-- - If you want to log IP, you need an Edge Function / reverse proxy to pass it.

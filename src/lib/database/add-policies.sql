-- Agregar políticas RLS para todas las tablas
-- Ejecutar en Supabase SQL Editor

-- =============================================
-- POLÍTICAS PARA LECTURA PÚBLICA
-- =============================================

-- Tournament - lectura pública
DROP POLICY IF EXISTS "Permitir lectura tournament" ON tournament;
CREATE POLICY "Permitir lectura tournament" ON tournament FOR SELECT USING (true);

-- Team - lectura pública
DROP POLICY IF EXISTS "Permitir lectura team" ON team;
CREATE POLICY "Permitir lectura team" ON team FOR SELECT USING (true);

-- Player - lectura pública
DROP POLICY IF EXISTS "Permitir lectura player" ON player;
CREATE POLICY "Permitir lectura player" ON player FOR SELECT USING (true);

-- Match Day - lectura pública
DROP POLICY IF EXISTS "Permitir lectura match_day" ON match_day;
CREATE POLICY "Permitir lectura match_day" ON match_day FOR SELECT USING (true);

-- Match - lectura pública
DROP POLICY IF EXISTS "Permitir lectura match" ON match;
CREATE POLICY "Permitir lectura match" ON match FOR SELECT USING (true);

-- Goal - lectura pública
DROP POLICY IF EXISTS "Permitir lectura goal" ON goal;
CREATE POLICY "Permitir lectura goal" ON goal FOR SELECT USING (true);

-- Card - lectura pública
DROP POLICY IF EXISTS "Permitir lectura card" ON card;
CREATE POLICY "Permitir lectura card" ON card FOR SELECT USING (true);

-- Sanction - lectura pública
DROP POLICY IF EXISTS "Permitir lectura sanction" ON sanction;
CREATE POLICY "Permitir lectura sanction" ON sanction FOR SELECT USING (true);

-- Document - lectura pública
DROP POLICY IF EXISTS "Permitir lectura document" ON document;
CREATE POLICY "Permitir lectura document" ON document FOR SELECT USING (true);

-- News - lectura pública
DROP POLICY IF EXISTS "Permitir lectura news" ON news;
CREATE POLICY "Permitir lectura news" ON news FOR SELECT USING (true);

-- Admin User - solo lectura
DROP POLICY IF EXISTS "Permitir lectura admin_user" ON admin_user;
CREATE POLICY "Permitir lectura admin_user" ON admin_user FOR SELECT USING (true);

-- Audit Log - solo lectura
DROP POLICY IF EXISTS "Permitir lectura audit_log" ON audit_log;
CREATE POLICY "Permitir lectura audit_log" ON audit_log FOR SELECT USING (true);

SELECT 'Políticas creadas' AS resultado;
-- Politicas completas para-admin y lectura publica
-- Ejecutar en Supabase SQL Editor

-- =============================================
-- TODAS LAS POLITICAS (SELECT, INSERT, UPDATE, DELETE)
-- =============================================

-- Tournament
DROP POLICY IF EXISTS "public_read_tournament" ON tournament;
CREATE POLICY "public_read_tournament" ON tournament FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_tournament" ON tournament;
CREATE POLICY "admin_all_tournament" ON tournament FOR ALL USING (true);

-- Team
DROP POLICY IF EXISTS "public_read_team" ON team;
CREATE POLICY "public_read_team" ON team FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_team" ON team;
CREATE POLICY "admin_all_team" ON team FOR ALL USING (true);

-- Player
DROP POLICY IF EXISTS "public_read_player" ON player;
CREATE POLICY "public_read_player" ON player FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_player" ON player;
CREATE POLICY "admin_all_player" ON player FOR ALL USING (true);

-- Match Day
DROP POLICY IF EXISTS "public_read_match_day" ON match_day;
CREATE POLICY "public_read_match_day" ON match_day FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_match_day" ON match_day;
CREATE POLICY "admin_all_match_day" ON match_day FOR ALL USING (true);

-- Match
DROP POLICY IF EXISTS "public_read_match" ON match;
CREATE POLICY "public_read_match" ON match FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_match" ON match;
CREATE POLICY "admin_all_match" ON match FOR ALL USING (true);

-- Goal
DROP POLICY IF EXISTS "public_read_goal" ON goal;
CREATE POLICY "public_read_goal" ON goal FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_goal" ON goal;
CREATE POLICY "admin_all_goal" ON goal FOR ALL USING (true);

-- Card
DROP POLICY IF EXISTS "public_read_card" ON card;
CREATE POLICY "public_read_card" ON card FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_card" ON card;
CREATE POLICY "admin_all_card" ON card FOR ALL USING (true);

-- Sanction
DROP POLICY IF EXISTS "public_read_sanction" ON sanction;
CREATE POLICY "public_read_sanction" ON sanction FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_sanction" ON sanction;
CREATE POLICY "admin_all_sanction" ON sanction FOR ALL USING (true);

-- Document
DROP POLICY IF EXISTS "public_read_document" ON document;
CREATE POLICY "public_read_document" ON document FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_document" ON document;
CREATE POLICY "admin_all_document" ON document FOR ALL USING (true);

-- News
DROP POLICY IF EXISTS "public_read_news" ON news;
CREATE POLICY "public_read_news" ON news FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_news" ON news;
CREATE POLICY "admin_all_news" ON news FOR ALL USING (true);

-- Admin User
DROP POLICY IF EXISTS "public_read_admin_user" ON admin_user;
CREATE POLICY "public_read_admin_user" ON admin_user FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_admin_user" ON admin_user;
CREATE POLICY "admin_all_admin_user" ON admin_user FOR ALL USING (true);

-- Audit Log
DROP POLICY IF EXISTS "admin_read_audit_log" ON audit_log;
CREATE POLICY "admin_read_audit_log" ON audit_log FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_audit_log" ON audit_log;
CREATE POLICY "admin_all_audit_log" ON audit_log FOR ALL USING (true);

SELECT 'Políticas creadas (lectura + admin)' AS resultado;
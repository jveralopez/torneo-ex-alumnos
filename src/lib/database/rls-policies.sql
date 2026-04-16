-- Row Level Security Policies para el Torneo de Ex Alumnos
-- Este archivo puede ejecutarse en el editor SQL de Supabase

-- =============================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- =============================================

ALTER TABLE tournament ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE player ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE match ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal ENABLE ROW LEVEL SECURITY;
ALTER TABLE card ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanction ENABLE ROW LEVEL SECURITY;
ALTER TABLE document ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_user ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLITICAS DE LECTURA PUBLICA
-- =============================================

-- Tournament: cualquier persona puede ver
CREATE POLICY "Torneos son publicos" ON tournament
    FOR SELECT USING (true);

-- Team: cualquier persona puede ver equipos activos
CREATE POLICY "Equipos activos son publicos" ON team
    FOR SELECT USING (active = true);

-- Player: cualquier persona puede ver jugadores activos
CREATE POLICY "Jugadores activos son publicos" ON player
    FOR SELECT USING (active = true);

-- Match Day: solo fechas visibles publicamente
CREATE POLICY "Fechas visibles son publicas" ON match_day
    FOR SELECT USING (visible_publicly = true);

-- Match: partidos de fechas visibles
CREATE POLICY "Partidos de fechas visibles son publicos" ON match
    FOR SELECT USING (
        match_day_id IN (
            SELECT id FROM match_day WHERE visible_publicly = true
        )
    );

-- Goal: goles de partidos jugados en fechas visibles
CREATE POLICY "Goles publicos" ON goal
    FOR SELECT USING (
        match_id IN (
            SELECT m.id FROM match m
            JOIN match_day md ON m.match_day_id = md.id
            WHERE md.visible_publicly = true AND m.status = 'jugado'
        )
    );

-- Card: tarjetas de partidos en fechas visibles
CREATE POLICY "Tarjetas publicas" ON card
    FOR SELECT USING (
        match_id IN (
            SELECT m.id FROM match m
            JOIN match_day md ON m.match_day_id = md.id
            WHERE md.visible_publicly = true
        )
    );

-- Sanction: sanciones vigentes de jugadores activos
CREATE POLICY "Sanciones vigentes son publicas" ON sanction
    FOR SELECT USING (
        player_id IN (
            SELECT id FROM player WHERE active = true
        ) AND status = 'vigente'
    );

-- Document: documentos activos
CREATE POLICY "Documentos activos son publicos" ON document
    FOR SELECT USING (active = true);

-- Admin User: solo usuarios autenticados pueden ver
CREATE POLICY "Solo admins ven admins" ON admin_user
    FOR SELECT USING (
        auth.uid() IS NOT NULL
    );

-- =============================================
-- POLITICAS DE ESCRITURA (SOLO AUTH)
-- =============================================

-- Tournament: solo usuarios autenticados
CREATE POLICY "Admins pueden gestionar torneos" ON tournament
    FOR ALL USING (auth.role() = 'authenticated');

-- Team: solo usuarios autenticados
CREATE POLICY "Admins pueden gestionar equipos" ON team
    FOR ALL USING (auth.role() = 'authenticated');

-- Player: solo usuarios autenticados
CREATE POLICY "Admins pueden gestionar jugadores" ON player
    FOR ALL USING (auth.role() = 'authenticated');

-- Match Day: solo usuarios autenticados
CREATE POLICY "Admins pueden gestionar fechas" ON match_day
    FOR ALL USING (auth.role() = 'authenticated');

-- Match: solo usuarios autenticados
CREATE POLICY "Admins pueden gestionar partidos" ON match
    FOR ALL USING (auth.role() = 'authenticated');

-- Goal: solo usuarios autenticados
CREATE POLICY "Admins pueden gestionar goles" ON goal
    FOR ALL USING (auth.role() = 'authenticated');

-- Card: solo usuarios autenticados
CREATE POLICY "Admins pueden gestionar tarjetas" ON card
    FOR ALL USING (auth.role() = 'authenticated');

-- Sanction: solo usuarios autenticados
CREATE POLICY "Admins pueden gestionar sanciones" ON sanction
    FOR ALL USING (auth.role() = 'authenticated');

-- Document: solo usuarios autenticados
CREATE POLICY "Admins pueden gestionar documentos" ON document
    FOR ALL USING (auth.role() = 'authenticated');

-- Admin User: solo usuarios autenticados
CREATE POLICY "Admins pueden gestionar usuarios" ON admin_user
    FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- NOTA IMPORTANTE
-- =============================================
-- Estas politicas usan auth.role() = 'authenticated' como filtro basico.
-- Para un control mas preciso, se debe verificar que el email del usuario
-- autenticado coincida con un registro en la tabla admin_user.
-- 
-- Ejemplo de politica mas restrictiva:
-- CREATE POLICY "Solo admins registrados" ON tournament
--     FOR ALL USING (
--         auth.email() IN (SELECT email FROM admin_user WHERE active = true)
--     );
-- 
-- Se recomienda ajustar las politicas segun las necesidades exactas del proyecto.
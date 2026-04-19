-- Seed automático - solo agrega datos si no existen
-- Ejecutar en Supabase SQL Editor

-- Verificar si ya hay datos
DO $$ 
BEGIN
    -- Si ya hay tournament activo, no crear otro
    IF (SELECT COUNT(*) FROM tournament WHERE status = 'activo') > 0 THEN
        RAISE NOTICE 'Ya existe un tournament activo, saltando creación de tournament';
        RETURN;
    END IF;

    -- =============================================
    -- 1. TORNEO
    -- =============================================
    
    INSERT INTO tournament (name, year, description, status, yellow_card_suspension_threshold)
    VALUES ('Torneo de Ex Alumnos', 2026, 'Campeonato anual de fútbol sala entre ex alumnos', 'activo', 3);
    
    RAISE NOTICE 'Torneo creado';
END $$;

-- =============================================
-- 2. EQUIPOS
-- =============================================

DO $$ 
DECLARE tid UUID;
BEGIN
    SELECT id INTO tid FROM tournament WHERE status = 'activo' LIMIT 1;
    IF tid IS NULL THEN RETURN; END IF;
    
    -- Solo crear equipos si no hay ninguno
    IF (SELECT COUNT(*) FROM team WHERE tournament_id = tid) > 0 THEN
        RAISE NOTICE 'Ya hay equipos';
        RETURN;
    END IF;
    
    INSERT INTO team (tournament_id, name, description, active)
    VALUES (tid, 'Los Terribles', 'Equipo de la promo 2015', true);
    
    INSERT INTO team (tournament_id, name, description, active)
    VALUES (tid, 'Los Veloces', 'Equipo de la promo 2018', true);
    
    INSERT INTO team (tournament_id, name, description, active)
    VALUES (tid, 'Los Gigantes', 'Equipo de la promo 2012', true);
    
    INSERT INTO team (tournament_id, name, description, active)
    VALUES (tid, 'Los Halcones', 'Equipo de la promo 2020', true);
    
    INSERT INTO team (tournament_id, name, description, active)
    VALUES (tid, 'Los Leones', 'Equipo de la promo 2016', true);
    
    INSERT INTO team (tournament_id, name, description, active)
    VALUES (tid, 'Los Tigres', 'Equipo de la promo 2019', true);
    
    RAISE NOTICE 'Equipos creados';
END $$;

-- =============================================
-- 3. JUGADORES (solo 2 equipos para simplificar)
-- =============================================

DO $$
DECLARE tid UUID; t1id UUID; t2id UUID;
BEGIN
    SELECT id INTO tid FROM tournament WHERE status = 'activo' LIMIT 1;
    IF tid IS NULL THEN RETURN; END IF;
    
    SELECT id INTO t1id FROM team WHERE tournament_id = tid AND name = 'Los Terribles' LIMIT 1;
    SELECT id INTO t2id FROM team WHERE tournament_id = tid AND name = 'Los Veloces' LIMIT 1;
    
    IF t1id IS NULL OR t2id IS NULL THEN RETURN; END IF;
    
    IF (SELECT COUNT(*) FROM player WHERE team_id = t1id) > 0 THEN
        RAISE NOTICE 'Ya hay jugadores';
        RETURN;
    END IF;
    
    -- Terribles
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t1id, 'Juan', 'Pérez', 1, 'Arquero');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t1id, 'Carlos', 'García', 4, 'Defensor');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t1id, 'Luis', 'Rodríguez', 8, 'Mediocampista');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t1id, 'Pedro', 'Martínez', 9, 'Delantero');
    
    -- Veloces
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t2id, 'Miguel', 'López', 1, 'Arquero');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t2id, 'Diego', 'González', 5, 'Defensor');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t2id, 'Fernando', 'Hernández', 10, 'Delantero');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t2id, 'Javier', 'Muñoz', 7, 'Mediocampista');
    
    RAISE NOTICE 'Jugadores creados';
END $$;

-- =============================================
-- 4. FECHAS
-- =============================================

DO $$
DECLARE tid UUID;
BEGIN
    SELECT id INTO tid FROM tournament WHERE status = 'activo' LIMIT 1;
    IF tid IS NULL THEN RETURN; END IF;
    
    IF (SELECT COUNT(*) FROM match_day WHERE tournament_id = tid) > 0 THEN
        RAISE NOTICE 'Ya hay fechas';
        RETURN;
    END IF;
    
    -- Fecha 1 - Visible y publicada
    INSERT INTO match_day (tournament_id, number, title, visible_publicly, published, reference_date)
    VALUES (tid, 1, 'Fecha 1 - Inaugural', true, true, '2026-04-20');
    
    -- Fecha 2 - Visible no publicada
    INSERT INTO match_day (tournament_id, number, title, visible_publicly, published, reference_date)
    VALUES (tid, 2, 'Fecha 2', true, false, '2026-04-27');
    
    -- Fecha 3 - Oculta
    INSERT INTO match_day (tournament_id, number, title, visible_publicly, published, reference_date)
    VALUES (tid, 3, 'Fecha 3', false, false, '2026-05-04');
    
    RAISE NOTICE 'Fechas creadas';
END $$;

-- =============================================
-- 5. PARTIDOS
-- =============================================

DO $$
DECLARE tid UUID; t1id UUID; t2id UUID; t3id UUID; t4id UUID;
    md1id UUID; md2id UUID;
BEGIN
    SELECT id INTO tid FROM tournament WHERE status = 'activo' LIMIT 1;
    IF tid IS NULL THEN RETURN; END IF;
    
    IF (SELECT COUNT(*) FROM match WHERE match_day_id IN (SELECT id FROM match_day WHERE tournament_id = tid)) > 0 THEN
        RAISE NOTICE 'Ya hay partidos';
        RETURN;
    END IF;
    
    SELECT id INTO t1id FROM team WHERE tournament_id = tid AND name = 'Los Terribles' LIMIT 1;
    SELECT id INTO t2id FROM team WHERE tournament_id = tid AND name = 'Los Veloces' LIMIT 1;
    SELECT id INTO t3id FROM team WHERE tournament_id = tid AND name = 'Los Gigantes' LIMIT 1;
    SELECT id INTO t4id FROM team WHERE tournament_id = tid AND name = 'Los Halcones' LIMIT 1;
    
    SELECT id INTO md1id FROM match_day WHERE tournament_id = tid AND number = 1 LIMIT 1;
    SELECT id INTO md2id FROM match_day WHERE tournament_id = tid AND number = 2 LIMIT 1;
    
    -- Fecha 1: Terribles 2-1 Veloces
    INSERT INTO match (match_day_id, home_team_id, away_team_id, scheduled_at, venue, status, home_goals, away_goals)
    VALUES (md1id, t1id, t2id, '2026-04-20 10:00:00+00', 'Cancha Principal', 'jugado', 2, 1);
    
    -- Fecha 1: Gigantes 0-2 Halcones
    INSERT INTO match (match_day_id, home_team_id, away_team_id, scheduled_at, venue, status, home_goals, away_goals)
    VALUES (md1id, t3id, t4id, '2026-04-20 12:00:00+00', 'Cancha Principal', 'jugado', 0, 2);
    
    -- Fecha 2: Terribles vs Gigantes (programado)
    INSERT INTO match (match_day_id, home_team_id, away_team_id, scheduled_at, venue, status)
    VALUES (md2id, t1id, t3id, '2026-04-27 10:00:00+00', 'Cancha Principal', 'programado');
    
    -- Fecha 2: Veloces vs Halcones (programado)
    INSERT INTO match (match_day_id, home_team_id, away_team_id, scheduled_at, venue, status)
    VALUES (md2id, t2id, t4id, '2026-04-27 12:00:00+00', 'Cancha Principal', 'programado');
    
    RAISE NOTICE 'Partidos creados';
END $$;

-- =============================================
-- 6. ADMIN (si no existe)
-- =============================================

DO $$
BEGIN
    IF (SELECT COUNT(*) FROM admin_user) > 0 THEN
        RAISE NOTICE 'Ya hay admin';
        RETURN;
    END IF;
    
    INSERT INTO admin_user (email, name, role, active)
    VALUES ('admin@torneo.com', 'Administrador', 'admin', true);
    
    RAISE NOTICE 'Admin creado';
END $$;

-- =============================================
-- RESUMEN
-- =============================================

SELECT 
    'Tournament' AS tabla,
    (SELECT COUNT(*) FROM tournament WHERE status = 'activo') AS registros
UNION ALL
SELECT 'Equipos', COUNT(*) FROM team
UNION ALL
SELECT 'Jugadores', COUNT(*) FROM player
UNION ALL
SELECT 'Fechas', COUNT(*) FROM match_day
UNION ALL
SELECT 'Partidos', COUNT(*) FROM match
UNION ALL
SELECT 'Admin', COUNT(*) FROM admin_user;
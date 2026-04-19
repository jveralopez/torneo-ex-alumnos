-- Seed completo y automático para el Torneo de Ex Alumnos
-- Ejecutar TODO este archivo en Supabase SQL Editor

-- =============================================
-- 1. TORNEO
-- =============================================

INSERT INTO tournament (name, year, description, status, yellow_card_suspension_threshold)
VALUES ('Torneo de Ex Alumnos', 2026, 'Campeonato anual de fútbol sala entre ex alumnos', 'activo', 3)
RETURNING id AS tournament_id \;

-- =============================================
-- 2. EQUIPOS (usar el ID del tournament)
-- =============================================

-- Obtener tournament ID primero
DO $$ 
DECLARE 
    tid UUID;
BEGIN
    SELECT id INTO tid FROM tournament WHERE status = 'activo' LIMIT 1;
    
    -- Equipo 1
    INSERT INTO team (tournament_id, name, description, active)
    VALUES (tid, 'Los Terribles', 'Equipo de la promo 2015', true)
    RETURNING id;
    
    -- Equipo 2
    INSERT INTO team (tournament_id, name, description, active)
    VALUES (tid, 'Los Veloces', 'Equipo de la promo 2018', true)
    RETURNING id;
    
    -- Equipo 3
    INSERT INTO team (tournament_id, name, description, active)
    VALUES (tid, 'Los Gigantes', 'Equipo de la promo 2012', true)
    RETURNING id;
    
    -- Equipo 4
    INSERT INTO team (tournament_id, name, description, active)
    VALUES (tid, 'Los Halcones', 'Equipo de la promo 2020', true)
    RETURNING id;
    
    -- Equipo 5
    INSERT INTO team (tournament_id, name, description, active)
    VALUES (tid, 'Los Leones', 'Equipo de la promo 2016', true)
    RETURNING id;
    
    -- Equipo 6
    INSERT INTO team (tournament_id, name, description, active)
    VALUES (tid, 'Los Tigres', 'Equipo de la promo 2019', true)
    RETURNING id;
END $$;

-- =============================================
-- 3. JUGADORES
-- =============================================

DO $$
DECLARE 
    t1id UUID;
    t2id UUID;
    t3id UUID;
    t4id UUID;
BEGIN
    -- Get team IDs
    SELECT id INTO t1id FROM team WHERE name = 'Los Terribles' LIMIT 1;
    SELECT id INTO t2id FROM team WHERE name = 'Los Veloces' LIMIT 1;
    SELECT id INTO t3id FROM team WHERE name = 'Los Gigantes' LIMIT 1;
    SELECT id INTO t4id FROM team WHERE name = 'Los Halcones' LIMIT 1;
    
    -- Terribles (4 jugadores)
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t1id, 'Juan', 'Pérez', 1, 'Arquero');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t1id, 'Carlos', 'García', 4, 'Defensor');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t1id, 'Luis', 'Rodríguez', 8, 'Mediocampista');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t1id, 'Pedro', 'Martínez', 9, 'Delantero');
    
    -- Veloces (4 jugadores)
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t2id, 'Miguel', 'López', 1, 'Arquero');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t2id, 'Diego', 'González', 5, 'Defensor');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t2id, 'Fernando', 'Hernández', 10, 'Delantero');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t2id, 'Javier', 'Muñoz', 7, 'Mediocampista');
    
    -- Gigantes (4 jugadores)
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t3id, 'Roberto', 'Torres', 1, 'Arquero');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t3id, 'Ricardo', 'Sandoval', 3, 'Defensor');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t3id, 'Ramón', 'Flores', 9, 'Delantero');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t3id, 'Raúl', 'Reyes', 6, 'Mediocampista');
    
    -- Halcones (4 jugadores)
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t4id, 'Sergio', 'Sánchez', 1, 'Arquero');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t4id, 'Sebastián', 'Rivera', 4, 'Defensor');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t4id, 'Samuel', 'Cruz', 10, 'Delantero');
    INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
    VALUES (t4id, 'Saúl', 'Mora', 8, 'Mediocampista');
END $$;

-- =============================================
-- 4. FECHAS
-- =============================================

DO $$
DECLARE 
    tid UUID;
    fd1 UUID;
    fd2 UUID;
    fd3 UUID;
BEGIN
    SELECT id INTO tid FROM tournament WHERE status = 'activo' LIMIT 1;
    
    -- Fecha 1 - Visible y publicada
    INSERT INTO match_day (tournament_id, number, title, visible_publicly, published, reference_date, status)
    VALUES (tid, 1, 'Fecha 1 - Inaugural', true, true, '2026-04-20', 'finalizado')
    RETURNING id INTO fd1;
    
    -- Fecha 2 - Visible pero no publicada
    INSERT INTO match_day (tournament_id, number, title, visible_publicly, published, reference_date, status)
    VALUES (tid, 2, 'Fecha 2', true, false, '2026-04-27', 'programado')
    RETURNING id INTO fd2;
    
    -- Fecha 3 - No visible, no publicada
    INSERT INTO match_day (tournament_id, number, title, visible_publicly, published, reference_date, status)
    VALUES (tid, 3, 'Fecha 3', false, false, '2026-05-04', 'programado')
    RETURNING id INTO fd3;
    
    -- =============================================
    -- 5. PARTIDOS
    -- =============================================
    
    DECLARE 
        e1 UUID; e2 UUID; e3 UUID; e4 UUID;
    BEGIN
        SELECT id INTO e1 FROM team WHERE name = 'Los Terribles' LIMIT 1;
        SELECT id INTO e2 FROM team WHERE name = 'Los Veloces' LIMIT 1;
        SELECT id INTO e3 FROM team WHERE name = 'Los Gigantes' LIMIT 1;
        SELECT id INTO e4 FROM team WHERE name = 'Los Halcones' LIMIT 1;
        
        -- Partido Fecha 1: Terribles 2-1 Veloces (ya jugado)
        INSERT INTO match (match_day_id, home_team_id, away_team_id, scheduled_at, venue, status, home_goals, away_goals)
        VALUES (fd1, e1, e2, '2026-04-20 10:00:00+00', 'Cancha Principal', 'jugado', 2, 1);
        
        -- Partido Fecha 1: Gigantes 0-2 Halcones (ya jouer)
        INSERT INTO match (match_day_id, home_team_id, away_team_id, scheduled_at, venue, status, home_goals, away_goals)
        VALUES (fd1, e3, e4, '2026-04-20 12:00:00+00', 'Cancha Principal', 'jugado', 0, 2);
        
        -- Partido Fecha 2: Terribles vs Gigantes (programado)
        INSERT INTO match (match_day_id, home_team_id, away_team_id, scheduled_at, venue, status)
        VALUES (fd2, e1, e3, '2026-04-27 10:00:00+00', 'Cancha Principal', 'programado');
        
        -- Partido Fecha 2: Veloces vs Halcones (programado)
        INSERT INTO match (match_day_id, home_team_id, away_team_id, scheduled_at, venue, status)
        VALUES (fd2, e2, e4, '2026-04-27 12:00:00+00', 'Cancha Principal', 'programado');
    END;
    
    -- =============================================
    -- 6. GOLES (Fecha 1)
    -- =============================================
    
    DECLARE 
        p1 UUID; p2 UUID; p3 UUID; p4 UUID;
        m1 UUID; m2 UUID;
    BEGIN
        -- Get players
        SELECT id INTO p1 FROM player WHERE team_id = (SELECT id FROM team WHERE name = 'Los Terribles') AND shirt_number = 8 LIMIT 1;
        SELECT id INTO p2 FROM player WHERE team_id = (SELECT id FROM team WHERE name = 'Los Terribles') AND shirt_number = 9 LIMIT 1;
        SELECT id INTO p3 FROM player WHERE team_id = (SELECT id FROM team WHERE name = 'Los Halcones') AND shirt_number = 10 LIMIT 1;
        SELECT id INTO p4 FROM player WHERE team_id = (SELECT id FROM team WHERE name = 'Los Halcones') AND shirt_number = 8 LIMIT 1;
        
        -- Get matches
        SELECT id INTO m1 FROM match WHERE status = 'jugado' ORDER BY created_at LIMIT 1;
        SELECT id INTO m2 FROM match WHERE status = 'jugado' ORDER BY created_at LIMIT 2 OFFSET 1;
        
        -- Goles Terribles (2)
        INSERT INTO goal (match_id, player_id, team_id, quantity) VALUES (m1, p1, (SELECT id FROM team WHERE name = 'Los Terribles'), 1);
        INSERT INTO goal (match_id, player_id, team_id, quantity) VALUES (m1, p2, (SELECT id FROM team WHERE name = 'Los Terribles'), 1);
        
        -- Goles Halcones (2)
        INSERT INTO goal (match_id, player_id, team_id, quantity) VALUES (m2, p3, (SELECT id FROM team WHERE name = 'Los Halcones'), 1);
        INSERT INTO goal (match_id, player_id, team_id, quantity) VALUES (m2, p4, (SELECT id FROM team WHERE name = 'Los Halcones'), 1);
    END;
END $$;

-- =============================================
-- 7. ADMIN
-- =============================================

INSERT INTO admin_user (email, name, role, active)
VALUES ('admin@torneo.com', 'Administrador', 'admin', true);

-- =============================================
-- VERIFICAR
-- =============================================

SELECT 
    (SELECT COUNT(*) FROM tournament) AS tournaments,
    (SELECT COUNT(*) FROM team) AS teams,
    (SELECT COUNT(*) FROM player) AS players,
    (SELECT COUNT(*) FROM match_day) AS match_days,
    (SELECT COUNT(*) FROM match) AS matches,
    (SELECT COUNT(*) FROM goal) AS goals,
    (SELECT COUNT(*) FROM admin_user) AS admins;
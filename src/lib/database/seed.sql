-- Datos de ejemplo para desarrollo
-- Este archivo puede ejecutarse en el editor SQL de Supabase

-- =============================================
-- TORNEO EJEMPLO
-- =============================================

INSERT INTO tournament (name, year, description, status, regulation_url, yellow_card_suspension_threshold)
VALUES (
    'Torneo de Ex Alumnos',
    2026,
    'Campeonato anual de futbol sala entre ex alumnos del colegio',
    'activo',
    NULL,
    3
) RETURNING id;

-- =============================================
-- EQUIPOS EJEMPLO (usar el ID del torneo insertado)
-- =============================================

-- Reemplazar 'TORNEO_ID' con el ID real del torneo
INSERT INTO team (tournament_id, name, description, active)
VALUES 
    ('TORNEO_ID', 'Los Terribles', 'Equipo de la promo 2015', true),
    ('TORNEO_ID', 'Los Veloces', 'Equipo de la promo 2018', true),
    ('TORNEO_ID', 'Los Gigantes', 'Equipo de la promo 2012', true),
    ('TORNEO_ID', 'Los Halcones', 'Equipo de la promo 2020', true),
    ('TORNEO_ID', 'Los Leones', 'Equipo de la promo 2016', true),
    ('TORNEO_ID', 'Los Tigres', 'Equipo de la promo 2019', true)
RETURNING id, name;

-- =============================================
-- JUGADORES EJEMPLO (usar IDs de equipos reales)
-- =============================================

-- Equipo 1 - Los Terribles
INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
VALUES 
    ('EQUIPO_1', 'Juan', 'Perez', 1, 'Arquero'),
    ('EQUIPO_1', 'Carlos', 'Garcia', 4, 'Defensor'),
    ('EQUIPO_1', 'Luis', 'Rodriguez', 8, 'Mediocampista'),
    ('EQUIPO_1', 'Pedro', 'Martinez', 9, 'Delantero');

-- Equipo 2 - Los Veloces
INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
VALUES 
    ('EQUIPO_2', 'Miguel', 'Lopez', 1, 'Arquero'),
    ('EQUIPO_2', 'Diego', 'Gonzalez', 5, 'Defensor'),
    ('EQUIPO_2', 'Fernando', 'Hernandez', 10, 'Delantero');

-- =============================================
-- FECHAS EJEMPLO
-- =============================================

INSERT INTO match_day (tournament_id, number, title, visible_publicly, published, reference_date)
VALUES 
    ('TORNEO_ID', 1, 'Fecha 1 - Inaugural', true, true, '2026-04-20'),
    ('TORNEO_ID', 2, 'Fecha 2', false, false, '2026-04-27')
RETURNING id, number;

-- =============================================
-- PARTIDOS EJEMPLO (usar IDs de equipos y fechas reales)
-- =============================================

-- Partido Fecha 1: Terribles vs Veloces
INSERT INTO match (match_day_id, home_team_id, away_team_id, scheduled_at, venue, status)
VALUES 
    ('FECHA_1_ID', 'EQUIPO_1', 'EQUIPO_2', '2026-04-20 10:00:00+00', 'Cancha Principal', 'jugado');

--Partido Fecha 1: Gigantes vs Halcones
INSERT INTO match (match_day_id, home_team_id, away_team_id, scheduled_at, venue, status)
VALUES 
    ('FECHA_1_ID', 'EQUIPO_3', 'EQUIPO_4', '2026-04-20 12:00:00+00', 'Cancha Principal', 'programado');

-- =============================================
-- USUARIO ADMIN EJEMPLO
-- =============================================

INSERT INTO admin_user (email, name, role, active)
VALUES 
    ('admin@torneo.com', 'Administrador', 'admin', true);

-- =============================================
-- NOTAS PARA USO
-- =============================================
-- 1. Ejecutar este script despues de tener las tablas creadas
-- 2. Reemplazar los IDs placeholder (TORNEO_ID, EQUIPO_1, etc.) con los IDs reales
-- 3. Para testing local, se puede usar la tabla auth.users de Supabase
-- 4. El password del usuario admin debe configurarse via el panel de Supabase Auth
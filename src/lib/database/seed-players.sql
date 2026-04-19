-- Cargar jugadores automaticamente para equipos existentes
-- Ejecutar en Supabase SQL Editor

-- =============================================
-- JUGADORES PARA CADA EQUIPO
-- =============================================

DO $$
DECLARE 
    equipos CURSOR FOR SELECT id, name FROM team WHERE active = true;
    e RECORD;
    nombres TEXT[] := ARRAY['Juan', 'Carlos', 'Luis', 'Pedro', 'Miguel', 'Diego', 'Fernando', 'Javier', 'Roberto', 'Ricardo', 'Ramón', 'Raúl', 'Sergio', 'Sebastián', 'Samuel', 'Saúl', 'Antonio', 'Andrés', 'Alejandro', 'Álvaro', 'Abram'];
    apellidos TEXT[] := ARRAY['Pérez', 'García', 'Rodriguez', 'Martínez', 'López', 'Gonzalez', 'Hernández', 'Muñoz', 'Torres', 'Sandoval', 'Flores', 'Reyes', 'Sánchez', 'Rivera', 'Cruz', 'Mora', 'Vega', 'Castro', 'Díaz', 'Morales'];
    posiciones TEXT[] := ARRAY['Arquero', 'Defensor', 'Mediocampista', 'Delantero'];
    num INT;
BEGIN
    OPEN equipos;
    LOOP
        FETCH equipos INTO e;
        EXIT WHEN NOT FOUND;
        
        -- Skip if already has players
        IF (SELECT COUNT(*) FROM player WHERE team_id = e.id) > 0 THEN
            RAISE NOTICE 'Equipo % ya tiene jugadores, saltando', e.name;
            CONTINUE;
        END IF;
        
        RAISE NOTICE 'Creando jugadores para %', e.name;
        
        -- Create 6 players per team
        FOR i IN 1..6 LOOP
            num := floor(random() * 20 + 1)::INT;
            
            INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
            VALUES (
                e.id,
                nombres[floor(random() * array_length(nombres, 1) + 1]::INT],
                apellidos[floor(random() * array_length(apombres, 1) + 1)::INT],
                i,
                posiciones[floor(random() * array_length(posiciones, 1) + 1)::INT]
            );
        END LOOP;
    END LOOP;
    CLOSE equipos;
    
    RAISE NOTICE 'Jugadores creados';
END $$;

-- Verificar
SELECT 
    t.name AS equipo,
    (SELECT COUNT(*) FROM player WHERE team_id = t.id) AS jugadores
FROM team t
ORDER BY t.name;
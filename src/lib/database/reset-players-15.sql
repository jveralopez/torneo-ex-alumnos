-- Resetear y crear 15 jugadores por equipo
-- Ejecutar en Supabase SQL Editor

-- =============================================
-- 1. BORRAR TODOS LOS JUGADORES
-- =============================================

DELETE FROM player;

-- =============================================
-- 2. CREAR 15 JUGADORES POR EQUIPO
-- =============================================

DO $$
DECLARE 
    equipos CURSOR FOR SELECT id, name FROM team;
    e RECORD;
    nombres TEXT[] := ARRAY['Juan', 'Carlos', 'Luis', 'Pedro', 'Miguel', 'Diego', 'Fernando', 'Javier', 'Roberto', 'Ricardo', 'Ramón', 'Raúl', 'Sergio', 'Sebastián', 'Samuel', 'Saúl', 'Antonio', 'Andrés', 'Alejandro', 'Álvaro', 'Gabriel', 'Gustavo', 'Gerardo', 'Gilberto', 'Tomás', 'Gustavo', 'Gabriel', 'Emilio', 'Enrique', 'Eduardo', 'Erick'];
    apellidos TEXT[] := ARRAY['Pérez', 'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Muñoz', 'Torres', 'Sandoval', 'Flores', 'Reyes', 'Sánchez', 'Rivera', 'Cruz', 'Mora', 'Vega', 'Castro', 'Díaz', 'Morales', 'Ortiz', 'Aguilar', 'Núñez', 'Escobar', 'Cortés', 'Mendez', 'Jiménez', 'Fernández', 'Romero', 'Álvarez'];
    posiciones TEXT[] := ARRAY['Arquero', 'Defensor', 'Mediocampista', 'Delantero'];
BEGIN
    OPEN equipos;
    LOOP
        FETCH equipos INTO e;
        EXIT WHEN NOT FOUND;
        
        RAISE NOTICE 'Creando 15 jugadores para: %', e.name;
        
        FOR num IN 1..15 LOOP
            INSERT INTO player (team_id, first_name, last_name, shirt_number, position)
            VALUES (
                e.id,
                nombres[(num - 1) % array_length(nombres, 1) + 1],
                apellidos[(num * 2 - 1) % array_length(apellidos, 1) + 1],
                num,
                posiciones[((num - 1) % 4) + 1]
            );
        END LOOP;
    END LOOP;
    CLOSE equipos;
    
    RAISE NOTICE 'Completado!';
END $$;

-- Verificar
SELECT 
    t.name AS equipo,
    COUNT(p.id) AS jugadores
FROM team t
LEFT JOIN player p ON p.team_id = t.id
GROUP BY t.id, t.name
ORDER BY t.name;
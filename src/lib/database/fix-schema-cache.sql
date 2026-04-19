-- Forzar refresh del schema cache de PostgREST
-- Ejecutar este script en el SQL Editor de Supabase

-- Forzar cache para tabla team
SELECT * FROM team LIMIT 0;

-- Forzar cache para tabla player  
SELECT * FROM player LIMIT 0;

-- Forzar cache para tabla news
SELECT * FROM news LIMIT 0;

-- Forzar cache para tabla match_day
SELECT * FROM match_day LIMIT 0;

-- Forzar cache para tabla match
SELECT * FROM match LIMIT 0;

-- Verificar columnas de team
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'team'
ORDER BY ordinal_position;
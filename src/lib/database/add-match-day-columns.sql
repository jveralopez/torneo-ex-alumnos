-- Agregar columnas faltantes a match_day
-- Ejecutar en SQL Editor de Supabase

-- Agregar reference_date si no existe
ALTER TABLE match_day ADD COLUMN IF NOT EXISTS reference_date DATE;

-- Forzar refresh del schema cache
SELECT * FROM match_day LIMIT 0;
NOTIFY pgrst, 'reload schema';

-- Verificar columnas
SELECT column_name FROM information_schema.columns WHERE table_name = 'match_day' ORDER BY ordinal_position;
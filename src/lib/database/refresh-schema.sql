-- Forzar refresh del schema cache de Supabase
-- Ejecutar en SQL Editor para actualizar el cache de columnas

-- Ver estructura actual de la tabla news
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'news';

-- También verificar que la tabla existe con todas las columnas
SELECT * FROM news LIMIT 0;
-- CREAR BUCKETS DE STORAGE EN SUPABASE
-- Ejecutar en Supabase SQL Editor NO funciona para Storage
-- 
-- OPCION 1: Ir a Dashboard → Storage → New Bucket
-- OPCION 2: Usar API de Supabase (requiere service_role key)
--
-- Below is a SQL alternative that might work if you have proper permissions:

-- Note: Storage buckets must be created through Supabase Dashboard or Management API
-- This script helps verify if they exist:

SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_file_types,
  created_at
FROM storage.buckets;

-- Para crear buckets, necesitas ejecutar este código desde tu aplicación
-- o usar el Dashboard de Supabase:
-- 1. Ve a Supabase Dashboard
-- 2. Storage (en el menú lateral)
-- 3. New Bucket
-- 4. Crea los siguiente buckets TODOS como públicos:


-- Buckets a crear:
-- | Nombre | Public | 
-- |--------|--------|
-- | team-shields | ✓ |
-- | team-photos | ✓ |
-- | player-photos | ✓ |
-- | documents | ✓ |

-- Click "Create bucket" para cada uno
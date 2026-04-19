-- POLÍTICAS DE STORAGE PARA BUCKETS PÚBLICOS
-- Ejecutar en Supabase SQL Editor

-- =============================================
-- POLÍTICAS PARA CADA BUCKET
-- =============================================

-- team-shields: permitir uploads públicos
DROP POLICY IF EXISTS "Public access to team-shields" ON storage.objects;
CREATE POLICY "Public access to team-shields" ON storage.objects
FOR SELECT USING (bucket_id = 'team-shields');

DROP POLICY IF EXISTS "Allow public uploads to team-shields" ON storage.objects;
CREATE POLICY "Allow public uploads to team-shields" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'team-shields');

DROP POLICY IF EXISTS "Allow public updates to team-shields" ON storage.objects;
CREATE POLICY "Allow public updates to team-shields" ON storage.objects
FOR UPDATE USING (bucket_id = 'team-shields');

DROP POLICY IF EXISTS "Allow public deletes to team-shields" ON storage.objects;
CREATE POLICY "Allow public deletes to team-shields" ON storage.objects
FOR DELETE USING (bucket_id = 'team-shields');

-- team-photos
DROP POLICY IF EXISTS "Public access to team-photos" ON storage.objects;
CREATE POLICY "Public access to team-photos" ON storage.objects
FOR SELECT USING (bucket_id = 'team-photos');

DROP POLICY IF EXISTS "Allow public uploads to team-photos" ON storage.objects;
CREATE POLICY "Allow public uploads to team-photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'team-photos');

DROP POLICY IF EXISTS "Allow public updates to team-photos" ON storage.objects;
CREATE POLICY "Allow public updates to team-photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'team-photos');

DROP POLICY IF EXISTS "Allow public deletes to team-photos" ON storage.objects;
CREATE POLICY "Allow public deletes to team-photos" ON storage.objects
FOR DELETE USING (bucket_id = 'team-photos');

-- player-photos
DROP POLICY IF EXISTS "Public access to player-photos" ON storage.objects;
CREATE POLICY "Public access to player-photos" ON storage.objects
FOR SELECT USING (bucket_id = 'player-photos');

DROP POLICY IF EXISTS "Allow public uploads to player-photos" ON storage.objects;
CREATE POLICY "Allow public uploads to player-photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'player-photos');

DROP POLICY IF EXISTS "Allow public updates to player-photos" ON storage.objects;
CREATE POLICY "Allow public updates to player-photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'player-photos');

DROP POLICY IF EXISTS "Allow public deletes to player-photos" ON storage.objects;
CREATE POLICY "Allow public deletes to player-photos" ON storage.objects
FOR DELETE USING (bucket_id = 'player-photos');

-- documents
DROP POLICY IF EXISTS "Public access to documents" ON storage.objects;
CREATE POLICY "Public access to documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow public uploads to documents" ON storage.objects;
CREATE POLICY "Allow public uploads to documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow public updates to documents" ON storage.objects;
CREATE POLICY "Allow public updates to documents" ON storage.objects
FOR UPDATE USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow public deletes to documents" ON storage.objects;
CREATE POLICY "Allow public deletes to documents" ON storage.objects
FOR DELETE USING (bucket_id = 'documents');

SELECT 'Políticas de storage creadas' AS resultado;
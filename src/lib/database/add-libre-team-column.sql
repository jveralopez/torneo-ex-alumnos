-- Run this in Supabase SQL Editor to add the column:
ALTER TABLE tournament ADD COLUMN IF NOT EXISTS libre_team_enabled BOOLEAN DEFAULT false;

-- Then refresh:
SELECT * FROM tournament LIMIT 0;
NOTIFY pgrst, 'reload schema';
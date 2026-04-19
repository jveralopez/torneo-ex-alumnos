import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yrgpkcnndsjlxuirrndh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjEzMDIsImV4cCI6MjA5MTg5NzMwMn0.lNgyShqXzgqeydVzGgSBi5EfkB0wM4oB6s5ryLrja00'
);

const matchDayId = 'ee94206a-cba2-47e9-93f5-0210bd969c9f';
const libreTeamId = '5cf519c7-a8a6-43a0-a77f-fe17e735319b';

const matches = [
  { match_day_id: matchDayId, home_team_id: libreTeamId, away_team_id: libreTeamId, scheduled_at: '2026-04-20T09:00:00' },
  { match_day_id: matchDayId, home_team_id: libreTeamId, away_team_id: libreTeamId, scheduled_at: '2026-04-20T09:45:00' },
  { match_day_id: matchDayId, home_team_id: libreTeamId, away_team_id: libreTeamId, scheduled_at: '2026-04-20T10:30:00' },
  { match_day_id: matchDayId, home_team_id: libreTeamId, away_team_id: libreTeamId, scheduled_at: '2026-04-20T11:15:00' },
];

const { data, error } = await supabase.from('match').insert(matches).select();
console.log('Created:', JSON.stringify(data, null, 2), 'error:', error);
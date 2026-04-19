import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yrgpkcnndsjlxuirrndh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjEzMDIsImV4cCI6MjA5MTg5NzMwMn0.lNgyShqXzgqeydVzGgSBi5EfkB0wM4oB6s5ryLrja00'
);

// Check matches for the new match day
const { data: matches } = await supabase.from('match').select('*').eq('match_day_id', 'ee94206a-cba2-47e9-93f5-0210bd969c9f');
console.log('Matches:', JSON.stringify(matches, null, 2));

// Check teams
const { data: teams } = await supabase.from('team').select('id, name');
console.log('Teams:', JSON.stringify(teams, null, 2));

// Check tournament libre_team_enabled setting
const { data: tournament } = await supabase.from('tournament').select('libre_team_enabled').eq('id', '61c8237b-128b-4f7a-b627-52131360b9b0');
console.log('Tournament libre_team_enabled:', tournament);
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yrgpkcnndsjlxuirrndh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjEzMDIsImV4cCI6MjA5MTg5NzMwMn0.lNgyShqXzgqeydVzGgSBi5EfkB0wM4oB6s5ryLrja00'
);

// Check teams
const { data: teams } = await supabase.from('team').select('id, name');
console.log('Teams:', teams?.length, JSON.stringify(teams, null, 2));

// Check matches for a match day
const { data: matches } = await supabase.from('match').select('*').eq('match_day_id', '58d45e0c-b029-406b-819e-b16b1c86195a');
console.log('Matches for Fecha 1:', JSON.stringify(matches, null, 2));
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yrgpkcnndsjlxuirrndh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjEzMDIsImV4cCI6MjA5MTg5NzMwMn0.lNgyShqXzgqeydVzGgSBi5EfkB0wM4oB6s5ryLrja00'
);

// Get tournament
const { data: tournament } = await supabase.from('tournament').select('*').order('year', { ascending: false }).limit(1);
console.log('Tournament:', JSON.stringify(tournament, null, 2));

// Get match_days for that tournament
if (tournament && tournament[0]) {
  const { data: matchDays } = await supabase
    .from('match_day')
    .select('*')
    .eq('tournament_id', tournament[0].id);
  console.log('Match days for tournament:', JSON.stringify(matchDays, null, 2));
}
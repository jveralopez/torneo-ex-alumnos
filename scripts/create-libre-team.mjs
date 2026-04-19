import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yrgpkcnndsjlxuirrndh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjEzMDIsImV4cCI6MjA5MTg5NzMwMn0.lNgyShqXzgqeydVzGgSBi5EfkB0wM4oB6s5ryLrja00'
);

// Get tournament
const { data: tournament } = await supabase.from('tournament').select('id').eq('status', 'activo').limit(1);

// Create LIBRE team
const { data: team, error } = await supabase.from('team').insert({
  tournament_id: tournament[0].id,
  name: 'LIBRE',
  description: 'Equipo sin asignar',
  shield_url: null,
  team_photo_url: null,
  active: true
}).select().single();

console.log('LIBRE team created:', team, 'error:', error);
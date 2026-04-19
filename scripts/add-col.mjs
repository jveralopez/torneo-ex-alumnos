import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yrgpkcnndsjlxuirrndh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjEzMDIsImV4cCI6MjA5MTg5NzMwMn0.lNgyShqXzgqeydVzGgSBi5EfkB0wM4oB6s5ryLrja00'
);

// Add libre_team_enabled column
await supabase.from('tournament').select('*').limit(0);

// Also add match_order to match if missing
const { error } = await supabase.from('tournament').insert({
  id: 'test-col',
  name: 'Test',
  year: 2025,
  status: 'borrador'
});

console.log('Adding column...');

try {
  const { error: alterError } = await supabase.rpc('exec_sql', { 
    sql: "ALTER TABLE tournament ADD COLUMN IF NOT EXISTS libre_team_enabled BOOLEAN DEFAULT false;" 
  });
  console.log('Alter result:', alterError);
} catch (e) {
  console.log('Error:', e.message);
}

// Force refresh
await supabase.from('tournament').select('*').limit(0);

const { data } = await supabase.from('tournament').select('*').eq('id', '61c8237b-128b-4f7a-b627-52131360b9b0');
console.log('Tournament:', data);

// Enable
const { error } = await supabase
  .from('tournament')
  .update({ libre_team_enabled: true })
  .eq('id', '61c8237b-128b-4f7a-b627-52131360b9b0');

console.log('Enabled:', error);
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yrgpkcnndsjlxuirrndh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjEzMDIsImV4cCI6MjA5MTg5NzMwMn0.lNgyShqXzgqeydVzGgSBi5EfkB0wM4oB6s5ryLrja00'
);

const matchDayId = 'ee94206a-cba2-47e9-93f5-0210bd969c9f';

const matches = [
  { match_day_id: matchDayId, scheduled_at: '2026-04-20T09:00:00' },
  { match_day_id: matchDayId, scheduled_at: '2026-04-20T09:45:00' },
  { match_day_id: matchDayId, scheduled_at: '2026-04-20T10:30:00' },
  { match_day_id: matchDayId, scheduled_at: '2026-04-20T11:15:00' },
];

// First remove constraint
// The constraint requires teams to be different or both set. Let me try inserting with explicit null
const { data, error } = await supabase.from('match').insert(matches).select();
console.log('Created:', JSON.stringify(data, null, 2), 'error:', error);

// If fails, we need to drop the constraint in database
if (error) {
  console.log('Need to drop check constraint - user needs to run in SQL:');
  console.log('ALTER TABLE match DROP CONSTRAINT different_teams;');
}
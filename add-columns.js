const SUPABASE_URL = 'https://yrgpkcnndsjlxuirrndh.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjEzMDIsImV4cCI6MjA5MTg5NzMwMn0.lNgyShqXzgqeydVzGgSBi5EfkB0wM4oB6s5ryLrja00';

// Add missing columns to tournament table
const tables = [
  `ALTER TABLE tournament ADD COLUMN IF NOT EXISTS consecutive_yellow_suspension INTEGER DEFAULT 2;`,
  `ALTER TABLE tournament ADD COLUMN IF NOT EXISTS red_card_suspension_matches INTEGER DEFAULT 2;`,
];

for (const sql of tables) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql })
  });
  console.log(sql.substring(0, 50), res.status);
}

// Check current tournament data
const check = await fetch(`${SUPABASE_URL}/rest/v1/tournament?status=eq.activo`, {
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
  }
});
const data = await check.json();
console.log('Current tournament:', JSON.stringify(data, null, 2));
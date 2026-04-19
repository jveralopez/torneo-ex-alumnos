const SUPABASE_URL = 'https://yrgpkcnndsjlxuirrndh.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjEzMDIsImV4cCI6MjA5MTg5NzMwMn0.lNgyShqXzgqeydVzGgSBi5EfkB0wM4oB6s5ryLrja00';

// Check if columns exist
const check = await fetch(`${SUPABASE_URL}/rest/v1/tournament?select=consecutive_yellow_suspension,red_card_suspension_matches&limit=0`, {
  headers: { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY }
});

console.log('Check status:', check.status);

// If 400, need to add columns
if (check.status === 400) {
  console.log('Adding columns...');
}

// Add colums using SQL Editor in Supabase
// Run: ALTER TABLE tournament ADD COLUMN consecutive_yellow_suspension INTEGER DEFAULT 2;
// Run: ALTER TABLE tournament ADD COLUMN red_card_suspension_matches INTEGER DEFAULT 2;

// Or try via REST
const addCol = async (col, def) => {
  try {
    // Try inserting a dummy to trigger column creation (won't work, needs SQL)
    console.log(`Please run in SQL Editor: ALTER TABLE tournament ADD COLUMN ${col} INTEGER DEFAULT ${def};`);
  } catch(e) {
    console.log(e.message);
  }
};

addCol('consecutive_yellow_suspension', 2);
addCol('red_card_suspension_matches', 2);
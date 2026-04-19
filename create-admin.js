const SUPABASE_URL = 'https://yrgpkcnndsjlxuirrndh.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjEzMDIsImV4cCI6MjA5MTg5NzMwMn0.lNgyShqXzgqeydVzGgSBi5EfkB0wM4oB6s5ryLrja00';

// Create admin user
const response = await fetch(`${SUPABASE_URL}/rest/v1/admin_user`, {
  method: 'POST',
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    name: 'Administrador',
    email: 'admin@torneo.com',
    role: 'admin',
    active: true
  })
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));
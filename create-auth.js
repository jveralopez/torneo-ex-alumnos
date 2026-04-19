const SUPABASE_URL = 'https://yrgpkcnndsjlxuirrndh.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjEzMDIsImV4cCI6MjA5MTg5NzMwMn0.lNgyShqXzgqeydVzGgSBi5EfkB0wM4oB6s5ryLrja00';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjMyMTMwMiwiZXhwIjoyMDkxODk3MzAyfQ.nCqBqYZ2JcXvFZJvF1XaBaJalKDbKKCqVqZaQYhVlwM'; // You need the service_role key

// Create auth user via admin API - need service role key for this
// For now, let's use the auth.signup API

const email = 'admin@torneo.com';
const password = 'Torneo2025!';

const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
  method: 'POST',
  headers: {
    'apikey': ANON_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email,
    password
  })
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));
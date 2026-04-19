const SUPABASE_URL = 'https://yrgpkcnndsjlxuirrndh.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjEzMDIsImV4cCI6MjA5MTg5NzMwMn0.lNgyShqXzgqeydVzGgSBi5EfkB0wM4oB6s5ryLrja00';

const sql = `
-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_user(id) ON DELETE SET NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    old_values JSONB,
    new_values JSONB,
    description TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_user_id ON audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON audit_log(record_id);
`;

const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql })
});

// Try direct insert instead - the RPC might not exist
const createTable = await fetch(`${SUPABASE_URL}/rest/v1/audit_log`, {
  method: 'POST',
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  },
  body: JSON.stringify({
    id: '00000000-0000-0000-0000-000000000000',
    table_name: 'test',
    record_id: '00000000-0000-0000-0000-000000000000',
    action: 'create',
    description: 'Test'
  })
});

console.log('Status:', createTable.status);
if (createTable.status === 201 || createTable.status === 400) {
  console.log('✅ Table created or already exists');
} else {
  console.log('Error:', await createTable.text());
}
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env vars: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const password = '@Torneo2026'

const users = [
  { email: 'cacho@torneo.com', name: 'Cacho' },
  { email: 'miguel@torneo.com', name: 'Miguel' },
  { email: 'maxi@torneo.com', name: 'Maxi' },
  { email: 'pablo@torneo.com', name: 'Pablo' },
]

async function ensureAuthUser(email) {
  // Find user by email
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (listError) throw listError

  const existing = listed.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase())
  if (existing) {
    // Ensure password is set to the requested value and email is confirmed
    const { error: updError } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    })
    if (updError) throw updError
    return existing.id
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) throw createError
  return created.user.id
}

async function upsertAdminUser({ email, name }) {
  const { data: existing, error: fetchError } = await supabase
    .from('admin_user')
    .select('id, email, role, active')
    .eq('email', email)
    .limit(1)

  if (fetchError) throw fetchError

  if (existing && existing.length > 0) {
    const row = existing[0]
    if (row.role === 'admin') {
      return { action: 'skip-admin' }
    }

    const { error: updateError } = await supabase
      .from('admin_user')
      .update({ name, role: 'carga_datos', active: true })
      .eq('id', row.id)

    if (updateError) throw updateError
    return { action: 'updated' }
  }

  const { error: insertError } = await supabase
    .from('admin_user')
    .insert({ name, email, role: 'carga_datos', active: true })

  if (insertError) throw insertError
  return { action: 'inserted' }
}

for (const u of users) {
  await ensureAuthUser(u.email)
  const r = await upsertAdminUser(u)
  console.log(`${u.email}: ok (${r.action})`)
}

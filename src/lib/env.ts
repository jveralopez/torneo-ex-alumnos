function readEnv(name: keyof ImportMetaEnv) {
  return import.meta.env[name]?.trim() ?? ''
}

export const env = {
  appName: readEnv('VITE_APP_NAME') || 'Torneo Ex Alumnos',
  supabaseUrl: readEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: readEnv('VITE_SUPABASE_ANON_KEY'),
  demoMode: readEnv('VITE_DEMO_MODE') === 'true',
}

export const isSupabaseConfigured =
  env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0

export const isAdminSessionEnabled = readEnv('VITE_ADMIN_BYPASS') === 'true'

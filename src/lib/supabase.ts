import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { env, isSupabaseConfigured } from './env'

let supabaseClient: SupabaseClient | null = null

// Mock client for demo mode without Supabase
const mockSupabaseClient = {
  from: () => ({
    select: () => ({ 
      eq: () => ({ 
        single: () => Promise.resolve({ data: null, error: null }),
        limit: () => Promise.resolve({ data: [], error: null })
      }),
      in: () => ({ 
        eq: () => Promise.resolve({ data: [], error: null })
      }),
      order: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => ({ 
      select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) 
    }),
    update: () => ({ 
      eq: () => ({ 
        select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) 
      })
    }),
    delete: () => ({ 
      eq: () => Promise.resolve({ error: null })
    }),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: { path: '' }, error: null }),
      remove: () => Promise.resolve({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
} as unknown as SupabaseClient

export function getSupabaseClient() {
  // In demo mode without Supabase, return mock client
  if (env.demoMode && !isSupabaseConfigured) {
    return mockSupabaseClient
  }
  
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Complete VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  if (!supabaseClient) {
    supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey)
  }

  return supabaseClient
}

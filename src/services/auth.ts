import { getSupabaseClient } from '../lib/supabase'
import { env } from '../lib/env'
import type { AdminUser } from '../types/domain'

export type AuthUser = AdminUser | null

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: AuthUser
  isLoading: boolean
  isAuthenticated: boolean
}

// Demo admin user for testing
const DEMO_ADMIN: AdminUser = {
  id: 'demo-admin-1',
  email: 'admin@torneo.com',
  name: 'Administrador Demo',
  role: 'admin',
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export async function login(credentials: LoginCredentials) {
  // En modo demo, permitir cualquier login
  if (env.demoMode) {
    // Verificar credenciales simples o permitir acceso
    if (credentials.email && credentials.password) {
      return DEMO_ADMIN
    }
    throw new Error('Por favor ingresá email y contraseña')
  }
  
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('No se pudo iniciar sesión')
  }

  // Obtener datos del usuario admin
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_user')
    .select('*')
    .eq('email', credentials.email)
    .eq('active', true)
    .single()

  if (adminError || !adminUser) {
    // Cerrar sesión si no es usuario admin
    await supabase.auth.signOut()
    throw new Error('No tienes acceso de administrador')
  }

  return adminUser as AdminUser
}

export async function logout() {
  // En modo demo, solo limpiar estado local
  if (env.demoMode) {
    return
  }
  
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

export async function getCurrentUser(): Promise<AuthUser> {
  // En modo demo, retornar usuario demo si está autenticado
  if (env.demoMode) {
    const stored = localStorage.getItem('auth-storage')
    if (stored) {
      try {
        const authData = JSON.parse(stored)
        if (authData.state?.user) {
          return authData.state.user
        }
      } catch {}
    }
    return null
  }
  
  const supabase = getSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data: adminUser, error } = await supabase
    .from('admin_user')
    .select('*')
    .eq('email', user.email)
    .eq('active', true)
    .single()

  if (error || !adminUser) {
    return null
  }

  return adminUser as AdminUser
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

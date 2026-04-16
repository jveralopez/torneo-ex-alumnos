import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { appRoutes } from '../../utils/routes'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const from = location.state?.from?.pathname || appRoutes.admin

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Por favor completá todos los campos')
      return
    }

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    }
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <div className="w-full rounded-[2rem] border border-green-200 bg-white p-8 shadow-xl shadow-green-100/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">Acceso comisión</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-green-800">
              Login administrador
            </h1>
          </div>
          <Link
            to="/"
            className="rounded-xl border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-600 transition-colors hover:bg-green-500/20"
          >
            🏠 Volver
          </Link>
        </div>
        
        <p className="mt-3 text-sm leading-7 text-green-600">
          Ingresá tus credenciales para acceder al panel de administración.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-green-800">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-xl border-2 border-green-200 px-4 py-2.5 text-green-900 placeholder-green-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="admin@torneo.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-green-800">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-xl border-2 border-green-200 px-4 py-2.5 text-green-900 placeholder-green-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50 shadow-lg shadow-green-700/30"
          >
            {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </section>
  )
}
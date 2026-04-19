import { Outlet, NavLink, Link } from 'react-router-dom'

import { env } from '../../lib/env'
import { appRoutes } from '../../utils/routes'

const adminNavItems = [
  { to: appRoutes.admin, label: 'Dashboard', end: true },
  { to: appRoutes.adminTeams, label: 'Equipos' },
  { to: appRoutes.adminMatchDays, label: 'Fechas' },
  { to: appRoutes.adminSanctions, label: 'Sanciones' },
  { to: appRoutes.adminDocuments, label: 'Documentos' },
  { to: '/admin/noticias', label: 'Noticias' },
  { to: '/admin/configuracion', label: '⚙️ Config' },
]

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-green-300">Panel administrador</p>
              <h1 className="mt-2 text-2xl font-semibold">{env.appName}</h1>
            </div>
            <div className="flex gap-3">
              <Link
                to="/"
                className="rounded-xl border border-green-500/50 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400 transition-colors hover:bg-green-500/20"
              >
                🏠 Volver al sitio
              </Link>
            </div>
          </div>
        </header>
        
        <nav className="mt-6 flex flex-wrap gap-2">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                    : 'bg-white/5 text-slate-300 hover:bg-green-600/20 hover:text-green-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <main className="flex-1 py-8">
          <Outlet />
        </main>
        
        <footer className="mt-auto border-t border-white/10 bg-white/5 py-4">
          <p className="text-center text-sm text-slate-400">
            Esto es una solución diseñada y creada por{' '}
            <a 
              href="https://www.octolab.com.ar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 font-semibold underline"
            >
              Octolab
            </a>
            {' '}2026
          </p>
        </footer>
      </div>
    </div>
  )
}

import { NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { env } from '../../lib/env'
import { getActiveTournament } from '../../services/database'
import { publicNavigationLinks } from '../../utils/routes'

export function MainNavigation() {
  const { data: tournament } = useQuery({
    queryKey: ['activeTournament'],
    queryFn: getActiveTournament,
  })

  return (
    <header className="sticky top-4 z-10 rounded-2xl border border-green-200/60 bg-white/95 px-4 py-3 shadow-xl shadow-green-100/50 backdrop-blur sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-2xl shadow-lg">
            ⚽
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-700">
              {tournament ? `${tournament.name} ${tournament.year}` : env.appName}
            </p>
            <p className="mt-0.5 text-xl font-bold text-slate-900">{env.appName}</p>
          </div>
        </div>
        <nav aria-label="Principal" className="flex flex-wrap gap-2">
          {publicNavigationLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                [
                  'rounded-xl px-4 py-2.5 text-sm font-semibold transition-all shadow-sm',
                  isActive
                    ? 'bg-green-700 text-white shadow-lg shadow-green-700/30'
                    : 'bg-green-50 text-green-800 hover:bg-green-600 hover:text-white',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

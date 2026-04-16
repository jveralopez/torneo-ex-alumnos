import { useNavigate } from 'react-router-dom'
import { appRoutes } from '../../utils/routes'

const modules = [
  { name: 'Equipos', route: appRoutes.adminTeams, description: 'Gestiona los equipos del torneo' },
  { name: 'Jugadores', route: appRoutes.adminPlayers, description: 'Administra los planteles' },
  { name: 'Fechas y partidos', route: appRoutes.adminMatchDays, description: 'Configura el fixture' },
  { name: 'Resultados', route: appRoutes.adminMatchDays, description: 'Carga los resultados' },
  { name: 'Disciplina', route: appRoutes.adminSanctions, description: 'Sanciones y amonestaciones' },
  { name: 'Documentos', route: appRoutes.adminDocuments, description: 'Reglamento y convocatorias' },
]

export function DashboardPage() {
  const navigate = useNavigate()

  return (
    <section>
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="text-3xl font-semibold tracking-tight">Panel de Administración</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Gestiona el torneo desde aquí. Selecciona un módulo para comenzar.
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <button 
            type="button"
            key={module.name}
            onClick={() => navigate(module.route)}
            className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-colors cursor-pointer text-left"
          >
            <p className="text-lg font-medium">{module.name}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{module.description}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
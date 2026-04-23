export const appRoutes = {
  home: '/',
  fixture: '/fixture',
  results: '/resultados',
  standings: '/tabla',
  scorers: '/goleadores',
  teams: '/equipos',
  teamDetail: '/equipos/:id',
  regulation: '/reglamento',
  statistics: '/estadisticas',
  playersAtRisk: '/observacion',
  publicSanctions: '/sanciones',
  admin: '/admin',
  adminLogin: '/admin/login',
  adminTeams: '/admin/equipos',
  adminTeamsNew: '/admin/equipos/nuevo',
  adminTeamEdit: '/admin/equipos/:id',
  adminPlayers: '/admin/jugadores',
  adminPlayersNew: '/admin/jugadores/nuevo',
  adminPlayerEdit: '/admin/jugadores/:id',
  adminMatchDays: '/admin/fechas',
  adminMatchDaysId: '/admin/fechas/:id',
  adminMatchCards: '/admin/fechas/:id/tarjetas',
  adminSanctions: '/admin/sanciones',
  adminDocuments: '/admin/documentos',
  adminAudit: '/admin/auditoria',
  adminSettings: '/admin/configuracion',
  adminNews: '/admin/noticias',
} as const

type AppRoute = (typeof appRoutes)[keyof typeof appRoutes]

export interface NavigationLink {
  to: AppRoute
  label: string
  end?: boolean
}

export const publicNavigationLinks: NavigationLink[] = [
  { to: appRoutes.home, label: 'Inicio', end: true },
  { to: appRoutes.fixture, label: 'Fixture' },
  { to: appRoutes.standings, label: 'Tabla' },
  { to: appRoutes.teams, label: 'Equipos' },
  { to: appRoutes.scorers, label: 'Goleadores' },
  { to: appRoutes.playersAtRisk, label: 'Observación' },
  { to: appRoutes.publicSanctions, label: 'Sanciones' },
  { to: appRoutes.statistics, label: 'Estadísticas' },
  { to: appRoutes.regulation, label: 'Reglamento' },
  { to: appRoutes.admin, label: 'Admin' },
]
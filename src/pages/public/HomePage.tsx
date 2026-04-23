import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, NoticeBadge } from '../../components/ui'
import { getActiveTournament, getNextMatchDay, getMatches, getTeams, getRecentPlayedMatches, getPublicSanctions, getActiveNews } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import { appRoutes } from '../../utils/routes'
import type { Match, Team, News } from '../../types/domain'

export function HomePage() {
  const { tournamentId } = useTournamentId()

  const { data: tournament } = useQuery({
    queryKey: ['activeTournament'],
    queryFn: getActiveTournament,
  })

const { data: teams = [] } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeams(tournamentId!),
    enabled: !!tournamentId,
  })

  const { data: nextMatchDay } = useQuery({
    queryKey: ['nextMatchDay', tournamentId],
    queryFn: () => getNextMatchDay(tournamentId!),
    enabled: !!tournamentId,
  })

  // Obtener nombre del equipo libre si existe
  const freeTeamName = nextMatchDay?.freeTeamId 
    ? teams.find((t: Team) => t.id === nextMatchDay.freeTeamId)?.name 
    : null

  const { data: nextMatches = [] } = useQuery({
    queryKey: ['nextMatches', nextMatchDay?.id],
    queryFn: () => getMatches(nextMatchDay!.id),
    enabled: !!nextMatchDay?.id,
  })

  const { data: recentMatches = [] } = useQuery({
    queryKey: ['recentMatches', tournamentId],
    queryFn: () => getRecentPlayedMatches(tournamentId!, 5),
    enabled: !!tournamentId,
  })

  const { data: activeSanctions = [] } = useQuery({
    queryKey: ['publicSanctions', tournamentId],
    queryFn: () => getPublicSanctions(tournamentId!),
    enabled: !!tournamentId,
  })

  const { data: news = [] } = useQuery({
    queryKey: ['activeNews', tournamentId],
    queryFn: () => getActiveNews(tournamentId ?? undefined),
    staleTime: 0,
  })

  const isContentLoading = !tournamentId

  const getTeamName = (teamId: string) => {
    const team = teams.find((t: Team) => t.id === teamId)
    return team?.name || 'Equipo'
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    date.setHours(date.getHours() + 3) // Ajustar timezone
    return date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    date.setHours(date.getHours() + 3) // Ajustar timezone
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  if (isContentLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
      </div>
    )
  }

  return (
    <section className="space-y-8">
      {/* Avisos / Noticias - siempre muestra si hay news */}
      {news.length > 0 && (
        <div className="space-y-3">
          {news.map((notice: News) => (
            <Link
              key={notice.id}
              to={notice.link || '#'}
              className={`block rounded-xl border p-4 transition-all hover:shadow-lg ${
                notice.type === 'urgent'
                  ? 'border-red-200 bg-red-50 hover:border-red-400'
                  : notice.type === 'warning'
                  ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-400'
                  : notice.type === 'success'
                  ? 'border-green-200 bg-green-50 hover:border-green-400'
                  : 'border-blue-200 bg-blue-50 hover:border-blue-400'
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <NoticeBadge type={notice.type} />
                  <div>
                    <h3 className="font-bold text-slate-800">{notice.title}</h3>
                    <p 
                      className="text-sm text-slate-600" 
                      dangerouslySetInnerHTML={{ __html: notice.message }} 
                    />
                  </div>
                </div>
                {notice.link && (
                  <span className="text-sm font-medium text-blue-600 hover:underline">
                    {notice.linkLabel || 'Ver más →'}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Banner / Header - Football field style */}
      {tournament && (
        <div className="relative overflow-hidden rounded-[2rem] border border-green-300 bg-gradient-to-br from-green-800 via-green-700 to-green-900 px-6 py-12 text-white shadow-2xl shadow-green-500/30 sm:px-8">
          {/* Field pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 80px)`
          }} />
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 rotate-12 opacity-20">
            <div className="h-48 w-96 rounded-full bg-white" />
          </div>
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-12 opacity-10">
            <div className="h-32 w-72 rounded-full bg-green-400" />
          </div>
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-300">🏆 Tournament</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              {tournament.name}
            </h1>
            <p className="mt-3 text-xl font-medium text-green-200">Año {tournament.year}</p>
            {tournament.description && (
              <p className="mt-6 max-w-2xl text-base text-green-100/80">{tournament.description}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        {/* Próxima Fecha */}
        <Card>
          <CardHeader>
            <span className="flex items-center gap-2 font-bold text-green-800">
              <span className="text-lg">📅</span> Próxima Fecha
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {!nextMatchDay ? (
              <div className="py-8 text-center text-slate-500">
                No hay fechas programadas aún
              </div>
            ) : nextMatches.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                No hay partidos en la próxima fecha
              </div>
            ) : (
              <div className="divide-y divide-green-100">
                {nextMatches.map((match: Match) => (
                  <div key={match.id} className="flex items-center justify-between px-6 py-4 hover:bg-green-50 transition-colors">
                    <div className="flex-1 text-right font-semibold text-slate-900">
                      {getTeamName(match.homeTeamId)}
                    </div>
                    <div className="mx-4 flex flex-col items-center text-xs font-bold text-green-600">
                      <span>VS</span>
                    </div>
                    <div className="flex-1 text-left font-semibold text-slate-900">
                      {getTeamName(match.awayTeamId)}
                    </div>
                    <div className="ml-4 flex flex-col items-end text-xs font-medium text-slate-500">
                      <span className="text-green-700">{formatDate(match.scheduledAt)}</span>
                      {match.scheduledAt && <span className="text-green-600">{formatTime(match.scheduledAt)}</span>}
                    </div>
                  </div>
                ))}
                {/* Equipo Libre */}
                {freeTeamName && (
                  <div className="flex items-center justify-center px-6 py-3 bg-yellow-50 border-t border-yellow-100">
                    <span className="text-sm font-semibold text-yellow-700">
                      Libre: {freeTeamName}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimos Resultados */}
        <Card>
          <CardHeader>
            <span className="flex items-center gap-2 font-bold text-green-800">
              <span className="text-lg">⚽</span> Últimos Resultados
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {recentMatches.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                No hay resultados aún
              </div>
            ) : (
              <div className="divide-y divide-green-100">
                {recentMatches.slice(0, 5).map((match: Match) => (
                  <div key={match.id} className="flex items-center justify-between px-6 py-3 hover:bg-green-50 transition-colors">
                    <div className="flex-1 text-right text-sm font-semibold text-slate-900">
                      {getTeamName(match.homeTeamId)}
                    </div>
                    <div className="mx-3 flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-3 py-1.5 text-sm font-bold text-white shadow-md">
                      <span>{match.homeGoals ?? 0}</span>
                      <span className="text-green-200">-</span>
                      <span>{match.awayGoals ?? 0}</span>
                    </div>
                    <div className="flex-1 text-left text-sm font-semibold text-slate-900">
                      {getTeamName(match.awayTeamId)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links & Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Links Rápidos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <span className="flex items-center gap-2 font-bold text-green-800">
              <span className="text-lg">🚀</span> Acceso Rápido
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <QuickLink to={appRoutes.standings} label="Posiciones" icon="🏆" />
              <QuickLink to={appRoutes.scorers} label="Goleadores" icon="⚽" />
              <QuickLink to={appRoutes.playersAtRisk} label="Amonestados" icon="🟨" />
              <QuickLink to={appRoutes.regulation} label="Reglamento" icon="📋" />
            </div>
          </CardContent>
        </Card>

        {/* Sanciones Vigentes */}
        <Card>
          <CardHeader>
            <span className="flex items-center gap-2 font-bold text-green-800">
              <span className="text-lg">⚠️</span> Sancionados
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {activeSanctions.length === 0 ? (
              <div className="py-4 text-center text-sm text-green-600 font-medium">
                ✓ No hay sanciones vigentes
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-green-100">
                {activeSanctions.slice(0, 5).map((sanction: any) => (
                  <div key={sanction.id} className="px-4 py-3 hover:bg-green-50 transition-colors">
                    <p className="text-sm font-semibold text-slate-800">
                      {sanction.playerName}
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      {sanction.teamName} · {sanction.matchesServed}/{sanction.totalMatches} partidos
                    </p>
                  </div>
                ))}
                {activeSanctions.length > 5 && (
                  <div className="px-4 py-3 text-center">
                    <Link
                      to={appRoutes.publicSanctions}
                      className="text-sm font-semibold text-green-600 hover:text-green-800 hover:underline"
                    >
                      Ver todos ({activeSanctions.length}) →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function QuickLink({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-3 rounded-2xl border-2 border-green-100 bg-gradient-to-br from-green-50 to-white p-5 text-center transition-all hover:border-green-400 hover:from-green-100 hover:to-green-50 hover:shadow-lg hover:shadow-green-100"
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-semibold text-green-800">{label}</span>
    </Link>
  )
}

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { getTournamentStats, getTeams } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { Team } from '../../types/domain'

export function StatisticsPage() {
  const { tournamentId } = useTournamentId()
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['tournamentStats', tournamentId],
    queryFn: () => getTournamentStats(tournamentId!),
    enabled: !!tournamentId,
  })

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeams(tournamentId!),
    enabled: !!tournamentId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      </div>
    )
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Estadísticas</h1>
        <p className="mt-1 text-sm text-slate-600">
          Estadísticas generales del torneo
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Equipos"
          value={stats?.teams || 0}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Jugadores"
          value={stats?.players || 0}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <StatCard
          title="Partidos Jugados"
          value={`${stats?.matchesPlayed || 0}/${stats?.matchesTotal || 0}`}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Goles"
          value={stats?.goalsTotal || 0}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <span className="font-medium">Tarjetas</span>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                  <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6z" />
                  </svg>
                </span>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stats?.yellowCardsTotal || 0}</div>
                  <div className="text-sm text-slate-500">Amarillas</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6z" />
                  </svg>
                </span>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stats?.redCardsTotal || 0}</div>
                  <div className="text-sm text-slate-500">Rojas</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="font-medium">Promedio de Goles</span>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-sky-600">
                {stats?.matchesPlayed ? (stats.goalsTotal / stats.matchesPlayed).toFixed(1) : '0.0'}
              </div>
              <div className="mt-1 text-sm text-slate-500">goles por partido</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <span className="font-medium">Equipos Participantes</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team: Team) => (
              <div key={team.id} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
                {team.shieldUrl ? (
                  <img src={team.shieldUrl} alt={team.name} className="h-8 w-8 rounded object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-200 text-sm font-bold text-slate-500">
                    {team.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700">{team.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">{title}</div>
        </div>
      </CardContent>
    </Card>
  )
}

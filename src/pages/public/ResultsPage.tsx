import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { getPlayedMatches, getTeams } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { Match } from '../../types/domain'

export function ResultsPage() {
  const { tournamentId } = useTournamentId()
  
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['playedMatches', tournamentId],
    queryFn: () => getPlayedMatches(tournamentId!),
    enabled: !!tournamentId,
  })

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeams(tournamentId!),
    enabled: !!tournamentId,
  })

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    return team?.name || 'Equipo'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Resultados</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          No hay partidos jugados todavía. Los resultados aparecerán aquí una vez completados los partidos.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Resultados</h1>
        <p className="mt-1 text-sm text-slate-600">
          Partidos jugados del torneo
        </p>
      </div>

      <Card>
        <CardHeader>
          <span className="font-medium">Partidos ({matches.length})</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {matches.map((match: Match) => (
              <div key={match.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex flex-1 items-center justify-end gap-3">
                  <span className="text-right font-medium text-slate-900">{getTeamName(match.homeTeamId)}</span>
                  <span className="w-8 text-center text-slate-400">vs</span>
                  <span className="text-left font-medium text-slate-900">{getTeamName(match.awayTeamId)}</span>
                </div>
                <div className="ml-6 flex min-w-[100px] items-center justify-center">
                  <span className="rounded-lg bg-slate-100 px-4 py-2 text-lg font-bold text-slate-900">
                    {match.homeGoals} - {match.awayGoals}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

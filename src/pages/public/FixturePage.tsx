import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { getVisibleMatchDays, getMatches, getTeams } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { MatchDay, Match } from '../../types/domain'

export function FixturePage() {
  const { tournamentId } = useTournamentId()
  
  const { data: matchDays = [], isLoading } = useQuery({
    queryKey: ['visibleMatchDays', tournamentId],
    queryFn: () => getVisibleMatchDays(tournamentId!),
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

  if (matchDays.length === 0) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Fixture</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          El fixture aun no ha sido publicado. Pronto estara disponible.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Fixture</h1>
        <p className="mt-1 text-sm text-slate-600">
          Fechas publicadas del torneo
        </p>
      </div>

      {matchDays.map((matchDay: MatchDay) => (
        <MatchDaySection
          key={matchDay.id}
          matchDay={matchDay}
          getTeamName={getTeamName}
        />
      ))}
    </section>
  )
}

function MatchDaySection({
  matchDay,
  getTeamName,
}: {
  matchDay: MatchDay
  getTeamName: (teamId: string) => string
}) {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches', matchDay.id],
    queryFn: () => getMatches(matchDay.id),
    enabled: !!matchDay.id,
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">
            Fecha {matchDay.number}
            {matchDay.title && <span className="ml-2 font-normal text-slate-500">- {matchDay.title}</span>}
          </span>
          {matchDay.referenceDate && (
            <span className="text-sm text-slate-500">
              {new Date(matchDay.referenceDate).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
              })}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-slate-200 border-t-sky-600" />
          </div>
        ) : matches.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            Partido por definir
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {matches.map((match: Match) => (
              <MatchRow key={match.id} match={match} getTeamName={getTeamName} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MatchRow({
  match,
  getTeamName,
}: {
  match: Match
  getTeamName: (teamId: string) => string
}) {
  const isPlayed = match.status === 'jugado'

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex flex-1 items-center justify-end gap-3">
        <span className="text-right font-medium text-slate-900">{getTeamName(match.homeTeamId)}</span>
        <span className="w-8 text-center text-slate-400">vs</span>
        <span className="text-left font-medium text-slate-900">{getTeamName(match.awayTeamId)}</span>
      </div>

      <div className="ml-6 flex min-w-[100px] items-center justify-center">
        {isPlayed ? (
          <span className="rounded-lg bg-slate-100 px-4 py-2 text-lg font-bold text-slate-900">
            {match.homeGoals} - {match.awayGoals}
          </span>
        ) : match.scheduledAt ? (
          <span className="text-sm text-slate-500">
            {new Date(match.scheduledAt).toLocaleString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ) : match.status === 'suspendido' ? (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            Suspendido
          </span>
        ) : (
          <span className="text-sm text-slate-400">Por jugar</span>
        )}
      </div>

      {match.venue && (
        <span className="ml-4 min-w-[120px] text-right text-sm text-slate-500">
          {match.venue}
        </span>
      )}
    </div>
  )
}

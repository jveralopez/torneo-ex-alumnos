import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui'
import { getTeams } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { Team } from '../../types/domain'
import { appRoutes } from '../../utils/routes'

export function TeamsPage() {
  const { tournamentId, isLoading: tournamentLoading } = useTournamentId()
  
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeams(tournamentId!),
    enabled: !!tournamentId,
  })

  if (isLoading || tournamentLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Equipos</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          No hay equipos registrados todavía.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Equipos</h1>
        <p className="mt-1 text-sm text-slate-600">
          Equipos participantes del torneo
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team: Team) => (
          <Link key={team.id} to={`${appRoutes.teams}/${team.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                {team.shieldUrl ? (
                  <img
                    src={team.shieldUrl}
                    alt={team.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-2xl font-bold text-slate-400">
                    {team.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{team.name}</h3>
                  {team.description && (
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{team.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui'
import { getGoalsByPlayer } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'

interface ScorerEntry {
  player: {
    id: string
    firstName: string
    lastName: string
    photoUrl: string | null
    shirtNumber: number | null
    teamId: string
  }
  team: {
    id: string
    name: string
  }
  totalGoals: number
}

export function ScorersPage() {
  const { tournamentId } = useTournamentId()
  
  const { data: scorers = [], isLoading } = useQuery({
    queryKey: ['scorers', tournamentId],
    queryFn: () => getGoalsByPlayer(tournamentId!),
    enabled: !!tournamentId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      </div>
    )
  }

  if (scorers.length === 0) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Goleadores</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          No hay goles registrados todavía. Los goleadores aparecerán aquí una vez disputados los partidos.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Goleadores</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tabla de goleadores del torneo
        </p>
      </div>

      <Card>
        <CardHeader>
          <span className="font-medium">Posiciones ({scorers.length} jugadores)</span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="w-12">#</TableHeader>
                <TableHeader>Jugador</TableHeader>
                <TableHeader>Equipo</TableHeader>
                <TableHeader className="text-right">Goles</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {scorers.map((entry: ScorerEntry, index: number) => (
                <TableRow key={entry.player.id}>
                  <TableCell className="font-bold text-slate-900">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {entry.player.photoUrl && (
                        <img
                          src={entry.player.photoUrl}
                          alt={`${entry.player.firstName} ${entry.player.lastName}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-slate-900">
                          {entry.player.firstName} {entry.player.lastName}
                        </div>
                        {entry.player.shirtNumber && (
                          <div className="text-sm text-slate-500">#{entry.player.shirtNumber}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{entry.team.name}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-lg font-bold text-sky-800">
                      {entry.totalGoals}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}

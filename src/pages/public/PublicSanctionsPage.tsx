import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui'
import { getTeams, getPlayers, getPublicSanctions } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { Team, Player, Sanction } from '../../types/domain'

export function PublicSanctionsPage() {
  const { tournamentId } = useTournamentId()

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeams(tournamentId!),
    enabled: !!tournamentId,
  })

  const { data: allPlayers = [] } = useQuery<Player[]>({
    queryKey: ['allPlayers', tournamentId],
    queryFn: async () => {
      const playerPromises = teams.map(async (team: Team) => {
        return getPlayers(team.id)
      })
      const playersArrays = await Promise.all(playerPromises)
      return playersArrays.flat()
    },
    enabled: teams.length > 0,
  })

  const { data: sanctions = [], isLoading } = useQuery({
    queryKey: ['publicSanctions', tournamentId],
    queryFn: () => getPublicSanctions(tournamentId!),
    enabled: !!tournamentId,
  })

  const getTeamName = (teamId: string) => {
    const team = teams.find((t: Team) => t.id === teamId)
    return team?.name || 'Equipo'
  }

  const getPlayerName = (playerId: string) => {
    const player = allPlayers.find((p: Player) => p.id === playerId)
    return player ? `${player.firstName} ${player.lastName}` : 'Jugador'
  }

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
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Sanciones</h1>
        <p className="mt-1 text-sm text-slate-600">
          Jugadores con sanciones vigentes en el torneo
        </p>
      </div>

      <Card>
        <CardHeader>
          <span className="font-medium">Jugadores Sancionados ({sanctions.length})</span>
        </CardHeader>
        <CardContent className="p-0">
          {sanctions.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No hay jugadores sancionados actualmente.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Jugador</TableHeader>
                  <TableHeader>Equipo</TableHeader>
                  <TableHeader>Motivo</TableHeader>
                  <TableHeader>Origen</TableHeader>
                  <TableHeader>Partidos</TableHeader>
                  <TableHeader>Cumplidos</TableHeader>
                  <TableHeader>Pendientes</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {sanctions.map((sanction: Sanction) => (
                  <TableRow key={sanction.id}>
                    <TableCell className="font-medium text-slate-900">
                      {getPlayerName(sanction.playerId)}
                    </TableCell>
                    <TableCell>{getTeamName(sanction.teamId)}</TableCell>
                    <TableCell>{sanction.reason}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        sanction.origin === 'roja' 
                          ? 'bg-red-100 text-red-800' 
                          : sanction.origin === 'acumulacion_amarillas'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sanction.origin === 'roja' ? 'Tarjeta Roja' : 
                         sanction.origin === 'acumulacion_amarillas' ? 'Acumulación' : 'Manual'}
                      </span>
                    </TableCell>
                    <TableCell>{sanction.totalMatches}</TableCell>
                    <TableCell>{sanction.matchesServed}</TableCell>
                    <TableCell className="font-medium text-sky-600">
                      {sanction.totalMatches - sanction.matchesServed}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

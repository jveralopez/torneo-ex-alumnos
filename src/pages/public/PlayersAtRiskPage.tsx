import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui'
import { getPlayersNearSuspension, getActiveTournament } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { Player, Team } from '../../types/domain'

interface PlayerAtRisk {
  player: Player
  team: Team
  yellowCards: number
  yellowCardsInLastMatch: number
  matchDayNumber: number | null
  status: 'normal' | 'observation' | 'at_limit'
}

export function PlayersAtRiskPage() {
  const { tournamentId } = useTournamentId()
  
  // Get tournament for threshold
  const { data: tournament } = useQuery({
    queryKey: ['activeTournament'],
    queryFn: getActiveTournament,
  })
  
  const threshold = tournament?.yellowCardSuspensionThreshold || 4
  
  const { data: playersAtRisk = [], isLoading } = useQuery({
    queryKey: ['playersAtRisk', tournamentId, threshold],
    queryFn: () => getPlayersNearSuspension(tournamentId!, threshold),
    enabled: !!tournamentId,
  })

  // Filter: only observation (1+ in last match) or at_limit (threshold-1+ total)
  const playersWithRisk = playersAtRisk.filter(
    (p: PlayerAtRisk) => p.status !== 'normal'
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
      </div>
    )
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-green-200 bg-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-green-800">Jugadores en Observación</h1>
        <p className="mt-1 text-sm text-green-600 font-medium">
          Jugadores que pueden ser suspendidos en la próxima fecha
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-yellow-500/50 bg-yellow-100">
        <CardContent className="py-4">
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-3 w-3 rounded-full bg-yellow-600"></span>
              <span className="text-yellow-800 font-medium">
                <strong>1+ amarilla en última fecha</strong> → Si recibe otra, 2 consecutivas = 1 fecha
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-3 w-3 rounded-full bg-orange-600"></span>
              <span className="text-yellow-800 font-medium">
                <strong>{threshold - 1}+ acumuladas</strong> → 1 más llega a {threshold} = suspensión automática
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {playersWithRisk.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-green-600 font-medium">
            ✓ No hay jugadores en observación. Todos limpios.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* En límite (threshold-1 or more accumulated) */}
          {playersWithRisk.some((p: PlayerAtRisk) => p.status === 'at_limit') && (
            <Card className="border-orange-300">
              <CardHeader className="bg-orange-50">
                <span className="font-bold text-orange-700">
                  ⚠️ En Límite ({threshold - 1}+ amarillas acumuladas)
                </span>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Jugador</TableHeader>
                      <TableHeader>Equipo</TableHeader>
                      <TableHeader className="text-center">Amarillas Acumuladas</TableHeader>
                      <TableHeader>Estado</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {playersWithRisk
                      .filter((p: PlayerAtRisk) => p.status === 'at_limit')
                      .map((p: PlayerAtRisk) => (
                        <TableRow key={p.player.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                                {p.player.firstName.charAt(0)}{p.player.lastName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {p.player.firstName} {p.player.lastName}
                                </div>
                                {p.player.shirtNumber && (
                                  <div className="text-sm text-slate-500">#{p.player.shirtNumber}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{p.team.name}</TableCell>
                          <TableCell className="text-center font-bold text-orange-600">{p.yellowCards}</TableCell>
                          <TableCell>
                            <span className="inline-flex rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                              Una más y se suspende
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Observación (1+ in last match) */}
          {playersWithRisk.some((p: PlayerAtRisk) => p.status === 'observation') && (
            <Card className="border-yellow-300">
              <CardHeader className="bg-yellow-50">
                <span className="font-bold text-yellow-700">
                  👁️ Con 1 Amarilla en Última Fecha
                </span>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Jugador</TableHeader>
                      <TableHeader>Equipo</TableHeader>
                      <TableHeader>Fecha</TableHeader>
                      <TableHeader className="text-center">Total</TableHeader>
                      <TableHeader>Estado</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {playersWithRisk
                      .filter((p: PlayerAtRisk) => p.status === 'observation')
                      .map((p: PlayerAtRisk) => (
                        <TableRow key={p.player.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-sm font-bold text-yellow-600">
                                {p.player.firstName.charAt(0)}{p.player.lastName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {p.player.firstName} {p.player.lastName}
                                </div>
                                {p.player.shirtNumber && (
                                  <div className="text-sm text-slate-500">#{p.player.shirtNumber}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{p.team.name}</TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">
                              {p.matchDayNumber ? `Fecha ${p.matchDayNumber}` : '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-slate-500">{p.yellowCards}</TableCell>
                          <TableCell>
                            <span className="inline-flex rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-white">
                              Riesgo consecutivas
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Note about suspended */}
      <div className="rounded-lg bg-slate-100 p-4 text-center text-sm text-slate-500">
        Los jugadores suspendidos aparecen en la página de <a href="/sanciones" className="text-green-600 underline font-medium">Sanciones</a>
      </div>
    </section>
  )
}
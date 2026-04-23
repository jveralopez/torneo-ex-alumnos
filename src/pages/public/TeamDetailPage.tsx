import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Button } from '../../components/ui'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui'
import { getTeamById, getPlayers, getMatchesByTeam, getGoalsByTeam, getCardsByTeam } from '../../services/database'
import type { Player, Match, Goal, Card as CardType } from '../../types/domain'

interface TeamStats {
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export function TeamDetailPage() {
  const { id: teamId } = useParams<{ id: string }>()
  console.log('TeamDetailPage teamId:', teamId, 'trim:', teamId?.trim())

  const { data: team, isLoading: teamLoading, error: teamError } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => getTeamById(teamId!),
    enabled: !!teamId,
  })

  console.log('TeamDetail - teamId:', teamId, 'team:', team, 'teamError:', teamError)

  const { data: players = [], isLoading: playersLoading, error: playersError } = useQuery({
    queryKey: ['players', teamId],
    queryFn: () => getPlayers(teamId!),
    enabled: !!teamId,
  })

  console.log('TeamDetailPage - players:', players?.length, 'error:', playersError)

  const { data: matches = [] } = useQuery({
    queryKey: ['teamMatches', teamId],
    queryFn: () => getMatchesByTeam(teamId!),
    enabled: !!teamId,
  })

  const { data: goals = [] } = useQuery({
    queryKey: ['teamGoals', teamId],
    queryFn: () => getGoalsByTeam(teamId!),
    enabled: !!teamId,
  })

  const { data: cards = [] } = useQuery({
    queryKey: ['teamCards', teamId],
    queryFn: () => getCardsByTeam(teamId!),
    enabled: !!teamId,
  })

  const isLoading = teamLoading || playersLoading

  // Debug: show errors clearly
  if (teamError) {
    return (
      <section className="rounded-[2rem] border border-red-200 bg-red-50 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-red-800">Error al cargar equipo</h1>
        <p className="mt-3 text-sm text-red-600">{teamError.message}</p>
        <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
          Recargar página
        </Button>
      </section>
    )
  }

  if (playersError) {
    return (
      <section className="rounded-[2rem] border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-yellow-800">Advertencia</h1>
        <p className="mt-3 text-sm text-yellow-700">No se pudieron cargar los jugadores: {playersError.message}</p>
      </section>
    )
  }

  // Calculate team statistics
  const stats: TeamStats = (() => {
    const playedMatches = matches.filter((m: Match) => m.status === 'jugado')
    let won = 0
    let drawn = 0
    let lost = 0
    let goalsFor = 0
    let goalsAgainst = 0

    playedMatches.forEach((match: Match) => {
      const isHome = match.homeTeamId === teamId
      const teamGoals = isHome ? (match.homeGoals ?? 0) : (match.awayGoals ?? 0)
      const opponentGoals = isHome ? (match.awayGoals ?? 0) : (match.homeGoals ?? 0)

      goalsFor += teamGoals
      goalsAgainst += opponentGoals

      if (teamGoals > opponentGoals) won++
      else if (teamGoals === opponentGoals) drawn++
      else lost++
    })

    // 3 points for win, 2 for draw, 1 for loss, 0 for no-show
    const points = won * 3 + drawn * 2 + lost * 1

    return {
      played: playedMatches.length,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      points,
    }
  })()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      </div>
    )
  }

  // Debug: show raw state
  console.log('RENDER - team:', team, 'players:', players?.length)

  // Debug: even if team is null - show it
  if (!team) {
    return (
      <section className="rounded-[2rem] border border-orange-200 bg-orange-50 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-orange-800">Equipo no encontrado</h1>
        <p className="mt-3 text-sm text-orange-600">
          teamId: {teamId}
        </p>
        <p className="text-xs text-orange-500">
          teamLoading: {String(teamLoading)}
        </p>
        <Button variant="secondary" className="mt-4" onClick={() => window.history.back()}>
          Volver
        </Button>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-2">
          ← Volver
        </Button>
        <div className="flex items-center gap-6">
          {team.shieldUrl ? (
            <img
              src={team.shieldUrl}
              alt={team.name}
              className="h-24 w-24 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-100 text-4xl font-bold text-slate-400">
              {team.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{team.name}</h1>
            {team.description && (
              <p className="mt-1 text-sm text-slate-600">{team.description}</p>
            )}
          </div>
        </div>
        {/* Team Photo - banner style */}
        {team.teamPhotoUrl && (
          <div className="mt-4 w-full aspect-[16/9] overflow-hidden rounded-xl">
            <img
              src={team.teamPhotoUrl}
              alt={`Foto de ${team.name}`}
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}
      </div>

      {/* Team Statistics */}
      <Card>
        <CardHeader>
          <span className="font-medium">Estadísticas</span>
        </CardHeader>
        <CardContent>
          {stats.played === 0 ? (
            <div className="py-4 text-center text-slate-400">
              No hay partidos jugados todavía.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{stats.played}</div>
                <div className="text-xs text-slate-500">Partidos</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.won}</div>
                <div className="text-xs text-slate-500">Victorias</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.drawn}</div>
                <div className="text-xs text-slate-500">Empates</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.lost}</div>
                <div className="text-xs text-slate-500">Derrotas</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{stats.goalsFor}</div>
                <div className="text-xs text-slate-500">Goles a favor</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{stats.goalsAgainst}</div>
                <div className="text-xs text-slate-500">Goles en contra</div>
              </div>
              <div className="rounded-lg bg-sky-50 p-4 text-center">
                <div className="text-2xl font-bold text-sky-600">{stats.points}</div>
                <div className="text-xs text-slate-500">Puntos</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <span className="font-medium">Plantel ({players.length} jugadores)</span>
        </CardHeader>
        <CardContent className="p-0">
          {players.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No hay jugadores registrados en este equipo.
            </div>
          ) : (
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {players.map((player: Player) => {
                const playerGoals = goals.filter((g: Goal) => g.playerId === player.id).reduce((sum: number, g: Goal) => sum + g.quantity, 0)
                return (
                  <div key={player.id} className="flex items-center gap-4 rounded-lg border border-slate-100 p-3">
                    {player.photoUrl ? (
                      <img
                        src={player.photoUrl}
                        alt={`${player.firstName} ${player.lastName}`}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-400">
                        {player.firstName?.charAt(0)}{player.lastName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-slate-900">
                        {player.firstName} {player.lastName}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        {player.shirtNumber && <span className="font-bold">#{player.shirtNumber}</span>}
                        {player.position && <span>{player.position}</span>}
                        {playerGoals > 0 && <span className="text-sky-600">• {playerGoals} gol(es)</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Stats Table */}
      <Card>
        <CardHeader>
          <span className="font-medium">Estadísticas de Jugadores</span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Jugador</TableHeader>
                <TableHeader className="text-center">Goles</TableHeader>
                <TableHeader className="text-center">Amarillas</TableHeader>
                <TableHeader className="text-center">Rojas</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map((player: Player) => {
                const playerGoals = goals.filter((g: Goal) => g.playerId === player.id).reduce((sum: number, g: Goal) => sum + g.quantity, 0)
                const playerYellows = cards.filter((c: CardType) => c.playerId === player.id && c.type === 'amarilla').length
                const playerReds = cards.filter((c: CardType) => c.playerId === player.id && c.type === 'roja').length
                return (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">
                      {player.firstName} {player.lastName}
                      {player.shirtNumber && <span className="ml-2 text-slate-400">#{player.shirtNumber}</span>}
                    </TableCell>
                    <TableCell className="text-center font-bold text-green-600">{playerGoals}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${playerYellows > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-50 text-slate-400'}`}>
                        {playerYellows}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${playerReds > 0 ? 'bg-red-100 text-red-800' : 'bg-slate-50 text-slate-400'}`}>
                        {playerReds}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}

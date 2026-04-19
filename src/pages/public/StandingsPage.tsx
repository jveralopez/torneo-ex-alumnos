import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui'
import { getAllPlayedMatchesWithTeams, getTeams } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { Match, Team, StandingEntry } from '../../types/domain'

// Scoring: 3 points for win, 2 for draw, 1 for loss, 0 for no-show
const POINTS_WIN = 3
const POINTS_DRAW = 2
const POINTS_LOSS = 1

export function StandingsPage() {
  const { tournamentId } = useTournamentId()
  
  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['allPlayedMatches', tournamentId],
    queryFn: () => getAllPlayedMatchesWithTeams(tournamentId!),
    enabled: !!tournamentId,
    staleTime: 60000, // 1 minuto de cache
  })

  console.log('DEBUG StandingsPage - tournamentId:', tournamentId)
  console.log('DEBUG StandingsPage - matches:', matches)
  
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeams(tournamentId!),
    enabled: !!tournamentId,
    staleTime: 60000,
  })

  const standings = useMemo(() => {
    if (!teams.length) return []

    // Initialize standings for each team
    const standingsMap = new Map<string, StandingEntry>()

    teams.forEach((team: Team) => {
      standingsMap.set(team.id, {
        position: 0,
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      })
    })

    // Process each match
    matches.forEach((match: Match & { home_team?: { name: string }; away_team?: { name: string } }) => {
      const homeEntry = standingsMap.get(match.homeTeamId)
      const awayEntry = standingsMap.get(match.awayTeamId)

      if (!homeEntry || !awayEntry) return

      const homeGoals = match.homeGoals ?? 0
      const awayGoals = match.awayGoals ?? 0

      // Update played games
      homeEntry.played += 1
      awayEntry.played += 1

      // Update goals
      homeEntry.goalsFor += homeGoals
      homeEntry.goalsAgainst += awayGoals
      awayEntry.goalsFor += awayGoals
      awayEntry.goalsAgainst += homeGoals

      // Check if it was a no-show (0-3 with "no presentó" in notes)
      const isNoShowLocal = homeGoals === 0 && awayGoals === 3 && match.notes?.toLowerCase().includes('no se presentó') && match.notes?.toLowerCase().includes('local')
      const isNoShowVisita = homeGoals === 3 && awayGoals === 0 && match.notes?.toLowerCase().includes('no se presentó') && match.notes?.toLowerCase().includes('visita')

      // Determine result
      if (homeGoals > awayGoals) {
        // Home win
        homeEntry.won += 1
        homeEntry.points += POINTS_WIN
        // Away didn't show (3-0 with "visita no se presentó")
        if (isNoShowVisita) {
          // No-show: no points, no loss recorded
        } else {
          awayEntry.lost += 1
          awayEntry.points += POINTS_LOSS
        }
      } else if (homeGoals < awayGoals) {
        // Away win - check if home team didn't show
        if (isNoShowLocal) {
          // Local no-show: no points, no loss recorded
        } else {
          homeEntry.lost += 1
          homeEntry.points += POINTS_LOSS
        }
        awayEntry.won += 1
        awayEntry.points += POINTS_WIN
      } else {
        // Draw
        homeEntry.drawn += 1
        homeEntry.points += POINTS_DRAW
        awayEntry.drawn += 1
        awayEntry.points += POINTS_DRAW
      }
    })

    // Calculate goal difference
    standingsMap.forEach((entry) => {
      entry.goalDifference = entry.goalsFor - entry.goalsAgainst
    })

    // Sort by: points, goal difference, goals scored
    const sorted = Array.from(standingsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })

    // NO filtrar equipos sin partidos - mostrar todos
    // const filtered = sorted.filter(entry => entry.played > 0)

    // Asignar posiciones a todos
    sorted.forEach((entry, index) => {
      entry.position = index + 1
    })

    return sorted
  }, [teams, matches])

  const isLoading = matchesLoading || teamsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      </div>
    )
  }

  if (standings.length === 0) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Tabla de Posiciones</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          No hay equipos registrados en el torneo.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Tabla de Posiciones</h1>
        <p className="mt-1 text-sm text-slate-600">
          Posiciones actualizadas con puntaje: Victoria {POINTS_WIN}pts - Empate {POINTS_DRAW}pts - Derrota {POINTS_LOSS}pts
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader className="w-12">#</TableHeader>
                  <TableHeader>Equipo</TableHeader>
                  <TableHeader className="text-center">PJ</TableHeader>
                  <TableHeader className="text-center">PG</TableHeader>
                  <TableHeader className="text-center">PE</TableHeader>
                  <TableHeader className="text-center">PP</TableHeader>
                  <TableHeader className="text-center">GF</TableHeader>
                  <TableHeader className="text-center">GC</TableHeader>
                  <TableHeader className="text-center">DG</TableHeader>
                  <TableHeader className="text-center font-bold">Pts</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {standings.map((entry: StandingEntry) => (
                  <TableRow key={entry.team.id}>
                    <TableCell className="font-bold text-slate-900">{entry.position}</TableCell>
                    <TableCell className="font-medium text-slate-900">{entry.team.name}</TableCell>
                    <TableCell className="text-center">{entry.played}</TableCell>
                    <TableCell className="text-center text-green-600">{entry.won}</TableCell>
                    <TableCell className="text-center text-yellow-600">{entry.drawn}</TableCell>
                    <TableCell className="text-center text-red-600">{entry.lost}</TableCell>
                    <TableCell className="text-center">{entry.goalsFor}</TableCell>
                    <TableCell className="text-center">{entry.goalsAgainst}</TableCell>
                    <TableCell className="text-center">{entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}</TableCell>
                    <TableCell className="text-center font-bold text-sky-600">{entry.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

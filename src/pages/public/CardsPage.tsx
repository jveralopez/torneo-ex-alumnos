import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Select } from '../../components/ui'
import { getAllCards, getTeams } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'

interface CardDetail {
  type: 'amarilla' | 'roja'
  matchDayNumber: number
}

export function CardsPage() {
  const { tournamentId } = useTournamentId()
  const [teamFilter, setTeamFilter] = useState<string>('all')

  // Get all teams for filter
  const { data: teams = [] } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeams(tournamentId!),
    enabled: !!tournamentId,
  })

  // Get all cards
  const { data: allCards = [], isLoading } = useQuery({
    queryKey: ['allCards', tournamentId],
    queryFn: () => getAllCards(tournamentId!),
    enabled: !!tournamentId,
  })

  // Filter and sort
  const filteredCards = useMemo(() => {
    let cards = allCards
    
    // Filter by team
    if (teamFilter !== 'all') {
      cards = cards.filter(c => c.teamId === teamFilter)
    }
    
    return cards
  }, [allCards, teamFilter])

  // Format details for display
  const formatDetails = (details: CardDetail[]): string => {
    return details
      .map(d => `${d.matchDayNumber} (${d.type === 'amarilla' ? 'A' : 'R'})`)
      .join(', ')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <Card className="border-sky-200">
        <CardHeader>
          <h1 className="text-3xl font-bold tracking-tight text-sky-800">Tarjetas</h1>
          <p className="mt-1 text-sm text-sky-600 font-medium">
            Registro de tarjetas amarillas y rojas por jugador
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter */}
          <div className="max-w-xs">
            <Select
              label="Filtrar por equipo"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todos los equipos' },
                ...teams.map(t => ({ value: t.id, label: t.name }))
              ]}
            />
          </div>

          {/* Table */}
          {filteredCards.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No hay tarjetas registradas
            </div>
          ) : (
            <div className="overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Jugador</th>
                    <th className="px-3 py-2 text-left">Equipo</th>
                    <th className="px-3 py-2 text-center">Amarillas</th>
                    <th className="px-3 py-2 text-center">Rojas</th>
                    <th className="px-3 py-2 text-left">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCards.map((player) => (
                    <tr key={player.playerId} className="border-t border-slate-200">
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {player.playerName}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {player.teamName}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                          player.yellowCount > 0 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'text-slate-400'
                        }`}>
                          {player.yellowCount}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                          player.redCount > 0 
                            ? 'bg-red-100 text-red-700' 
                            : 'text-slate-400'
                        }`}>
                          {player.redCount}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500 text-xs">
                        {formatDetails(player.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
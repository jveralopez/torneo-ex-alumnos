import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Button } from '../../components/ui'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui'
import { Input, Select } from '../../components/ui'
import { getTeams, getPlayers, createCard, deleteCard, getCards, getMatchById } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { Team, Card as CardType, CardType as CardTypeEnum, Player } from '../../types/domain'

export function MatchCardsPage() {
  const { id: matchId } = useParams<{ id: string }>()
  const { tournamentId } = useTournamentId()

  const { data: match } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => getMatchById(matchId!),
    enabled: !!matchId,
  })

  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['cards', matchId],
    queryFn: () => getCards(matchId!),
    enabled: !!matchId,
  })

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeams(tournamentId!),
    enabled: !!tournamentId,
  })

  const { data: allPlayers = [] } = useQuery<Player[]>({
    queryKey: ['allPlayers'],
    queryFn: async () => {
      const playerPromises = teams.map(async (team: Team) => {
        const teamPlayers = await getPlayers(team.id)
        return teamPlayers
      })
      const playersArrays = await Promise.all(playerPromises)
      return playersArrays.flat()
    },
    enabled: teams.length > 0,
  })

  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const createMutation = useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', matchId] })
      setShowForm(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', matchId] })
    },
  })

  const getTeamName = (teamId: string) => {
    const team = teams.find((t: Team) => t.id === teamId)
    return team?.name || 'Equipo'
  }

  const getPlayerName = (playerId: string) => {
    const player = allPlayers.find((p: Player) => p.id === playerId)
    return player ? `${player.firstName} ${player.lastName}` : 'Jugador'
  }

  if (cardsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      </div>
    )
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tarjetas del Partido</h1>
          {match && (
            <p className="mt-1 text-sm text-slate-400">
              {getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}
            </p>
          )}
        </div>
        <Button onClick={() => setShowForm(true)}>
          Agregar Tarjeta
        </Button>
      </div>

      {showForm && (
        <CardForm
          matchId={matchId!}
          teams={teams}
          players={allPlayers}
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createMutation.mutate(data as Parameters<typeof createCard>[0])}
          isLoading={createMutation.isPending}
        />
      )}

      <Card>
        <CardHeader>
          <span className="font-medium">Tarjetas ({cards.length})</span>
        </CardHeader>
        <CardContent className="p-0">
          {cards.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No hay tarjetas registradas en este partido.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Tipo</TableHeader>
                  <TableHeader>Jugador</TableHeader>
                  <TableHeader>Equipo</TableHeader>
                  <TableHeader>Minuto</TableHeader>
                  <TableHeader className="text-right">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {cards.map((card: CardType) => (
                  <TableRow key={card.id}>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        card.type === 'roja' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {card.type === 'roja' ? 'Roja' : 'Amarilla'}
                      </span>
                    </TableCell>
                    <TableCell>{getPlayerName(card.playerId)}</TableCell>
                    <TableCell>{getTeamName(card.teamId)}</TableCell>
                    <TableCell>{card.minute ? `${card.minute}'` : '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(card.id)}
                      >
                        Eliminar
                      </Button>
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

function CardForm({
  matchId,
  teams,
  players,
  onClose,
  onSubmit,
  isLoading,
}: {
  matchId: string
  teams: Team[]
  players: Player[]
  onClose: () => void
  onSubmit: (data: Partial<CardType>) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    teamId: '',
    playerId: '',
    type: 'amarilla',
    minute: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.teamId || !formData.playerId) return
    
    onSubmit({
      matchId,
      teamId: formData.teamId,
      playerId: formData.playerId,
      type: formData.type as CardTypeEnum,
      minute: formData.minute ? parseInt(formData.minute, 10) : null,
    })
  }

  const teamPlayers = players.filter(p => p.teamId === formData.teamId)
  const teamOptions = teams.map(t => ({ value: t.id, label: t.name }))
  const playerOptions = teamPlayers.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName}` }))
  const cardTypeOptions = [
    { value: 'amarilla', label: 'Amarilla' },
    { value: 'roja', label: 'Roja' },
  ]

  return (
    <Card className="mb-6">
      <CardHeader>
        <span className="font-medium">Agregar Tarjeta</span>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Equipo"
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value, playerId: '' })}
              options={teamOptions}
              placeholder="Seleccionar equipo"
              required
            />
            <Select
              label="Jugador"
              value={formData.playerId}
              onChange={(e) => setFormData({ ...formData, playerId: e.target.value })}
              options={playerOptions}
              placeholder="Seleccionar jugador"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Tipo"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={cardTypeOptions}
            />
            <Input
              label="Minuto"
              type="number"
              min="1"
              max="120"
              value={formData.minute}
              onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
              placeholder="90"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Agregar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

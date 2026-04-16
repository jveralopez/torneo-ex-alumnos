import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Button } from '../../components/ui'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui'
import { Input, Select } from '../../components/ui'
import { 
  getTeams, 
  getPlayers, 
  getMatchById,
  createGoal, 
  deleteGoal,
  createCard, 
  deleteCard,
  updateMatch,
  getGoals,
  getCards
} from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { Team, Player, Match, Goal, Card as CardType, CardType as CardTypeEnum, MatchStatus } from '../../types/domain'
import { appRoutes } from '../../utils/routes'

export function MatchReportPage() {
  const { id: matchId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tournamentId } = useTournamentId()
  const queryClient = useQueryClient()

  const { data: match } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => getMatchById(matchId!),
    enabled: !!matchId,
  })

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeams(tournamentId!),
    enabled: !!tournamentId,
  })

  const { data: allPlayers = [] } = useQuery<Player[]>({
    queryKey: ['allPlayers', tournamentId],
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

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', matchId],
    queryFn: () => getGoals(matchId!),
    enabled: !!matchId,
  })

  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['cards', matchId],
    queryFn: () => getCards(matchId!),
    enabled: !!matchId,
  })

  // Mutations
  const createGoalMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', matchId] })
      setShowGoalForm(false)
    },
  })

  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', matchId] })
    },
  })

  const createCardMutation = useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', matchId] })
      queryClient.invalidateQueries({ queryKey: ['activeSanctions'] }) // Check for automatic sanction
      setShowCardForm(false)
    },
  })

  const deleteCardMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', matchId] })
    },
  })

  const updateMatchMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Match> }) =>
      updateMatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] })
      setEditingResult(false)
    },
  })

  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)
  const [editingResult, setEditingResult] = useState(false)
  const [resultForm, setResultForm] = useState({
    homeGoals: '',
    awayGoals: '',
    status: 'programado',
    notes: '',
  })

  const getTeamName = (teamId: string) => {
    const team = teams.find((t: Team) => t.id === teamId)
    return team?.name || 'Equipo'
  }

  const getPlayerName = (playerId: string) => {
    const player = allPlayers.find((p: Player) => p.id === playerId)
    return player ? `${player.firstName} ${player.lastName}` : 'Jugador'
  }

  const homeTeamPlayers = allPlayers.filter(p => p.teamId === match?.homeTeamId)
  const awayTeamPlayers = allPlayers.filter(p => p.teamId === match?.awayTeamId)
  
  // Solo los equipos que disputan este partido
  const matchTeams = teams.filter((t: Team) => 
    t.id === match?.homeTeamId || t.id === match?.awayTeamId
  )

  const handleSaveResult = () => {
    if (!matchId) return
    updateMatchMutation.mutate({
      id: matchId,
      data: {
        homeGoals: resultForm.homeGoals ? parseInt(resultForm.homeGoals, 10) : null,
        awayGoals: resultForm.awayGoals ? parseInt(resultForm.awayGoals, 10) : null,
        status: resultForm.status as MatchStatus,
        notes: resultForm.notes || null,
      },
    })
  }

  if (goalsLoading || cardsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-green-600" />
      </div>
    )
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate(appRoutes.adminMatchDays)} className="text-white">
            ← Volver a Fechas
          </Button>
          <h1 className="mt-2 text-2xl font-bold text-white">Planilla del Partido</h1>
          {match && (
            <p className="mt-1 text-sm text-green-400 font-medium">
              {getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}
            </p>
          )}
        </div>
      </div>

      {/* Result & Status */}
      <Card className="border-green-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="font-bold text-green-800">Resultado</span>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                setResultForm({
                  homeGoals: match?.homeGoals?.toString() || '',
                  awayGoals: match?.awayGoals?.toString() || '',
                  status: match?.status || 'programado',
                  notes: match?.notes || '',
                })
                setEditingResult(true)
              }}
            >
              {match?.status === 'jugado' ? 'Editar Resultado' : 'Cargar Resultado'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {match ? (
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-800">{getTeamName(match.homeTeamId)}</div>
                <div className="mt-2 text-5xl font-black text-green-700">
                  {match.homeGoals ?? '-'}
                </div>
              </div>
              <div className="text-2xl font-bold text-green-400">vs</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-800">{getTeamName(match.awayTeamId)}</div>
                <div className="mt-2 text-5xl font-black text-green-700">
                  {match.awayGoals ?? '-'}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">Cargando partido...</div>
          )}
          
          {match?.status === 'jugado' && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-center text-sm text-green-700 font-medium">
              Partido disputado el {match.scheduledAt ? new Date(match.scheduledAt).toLocaleDateString('es-AR') : 'fecha no definida'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Result Modal */}
      {editingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md">
            <CardHeader>
              <span className="font-bold text-green-800">Cargar Resultado</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <label className="block text-sm font-semibold text-green-800 mb-2">
                      {getTeamName(match!.homeTeamId)}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={resultForm.homeGoals}
                      onChange={(e) => setResultForm({ ...resultForm, homeGoals: e.target.value })}
                      className="text-center text-2xl font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-400">-</span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-800 mb-2">
                      {getTeamName(match!.awayTeamId)}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={resultForm.awayGoals}
                      onChange={(e) => setResultForm({ ...resultForm, awayGoals: e.target.value })}
                      className="text-center text-2xl font-bold"
                    />
                  </div>
                </div>
                
                <Select
                  label="Estado del partido"
                  value={resultForm.status}
                  onChange={(e) => setResultForm({ ...resultForm, status: e.target.value })}
                  options={[
                    { value: 'programado', label: 'Programado' },
                    { value: 'jugado', label: 'Jugado' },
                    { value: 'suspendido', label: 'Suspendido' },
                    { value: 'reprogramado', label: 'Reprogramado' },
                  ]}
                />

                <Input
                  label="Observaciones del árbitro"
                  value={resultForm.notes}
                  onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })}
                  placeholder="Observaciones sobre el partido..."
                />

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setEditingResult(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveResult} isLoading={updateMatchMutation.isPending}>
                    Guardar Resultado
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals */}
      <Card className="border-green-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="font-bold text-green-800">Goles ({goals.length})</span>
            <Button size="sm" onClick={() => setShowGoalForm(true)}>
              + Agregar Gol
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {goals.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              No hay goles registrados
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Equipo</TableHeader>
                  <TableHeader>Jugador</TableHeader>
                  <TableHeader className="text-right">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {goals.map((goal: Goal) => (
                  <TableRow key={goal.id}>
                    <TableCell className="font-medium">{getTeamName(goal.teamId)}</TableCell>
                    <TableCell>{getPlayerName(goal.playerId)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoalMutation.mutate(goal.id)}
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

      {/* Goal Form */}
      {showGoalForm && (
        <GoalForm
          matchId={matchId!}
          teams={matchTeams}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          onClose={() => setShowGoalForm(false)}
          onSubmit={(data) => createGoalMutation.mutate(data as Parameters<typeof createGoal>[0])}
          isLoading={createGoalMutation.isPending}
        />
      )}

      {/* Cards */}
      <Card className="border-green-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="font-bold text-green-800">Tarjetas ({cards.length})</span>
            <Button size="sm" onClick={() => setShowCardForm(true)}>
              + Agregar Tarjeta
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {cards.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              No hay tarjetas registradas
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Tipo</TableHeader>
                  <TableHeader>Equipo</TableHeader>
                  <TableHeader>Jugador</TableHeader>
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
                    <TableCell className="font-medium">{getTeamName(card.teamId)}</TableCell>
                    <TableCell>{getPlayerName(card.playerId)}</TableCell>
                    <TableCell>{card.minute ? `${card.minute}'` : '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCardMutation.mutate(card.id)}
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

      {/* Card Form */}
      {showCardForm && (
        <CardForm
          matchId={matchId!}
          teams={matchTeams}
          players={allPlayers}
          onClose={() => setShowCardForm(false)}
          onSubmit={(data) => createCardMutation.mutate(data as Parameters<typeof createCard>[0])}
          isLoading={createCardMutation.isPending}
        />
      )}
    </section>
  )
}

function GoalForm({
  matchId,
  teams,
  homeTeamPlayers,
  awayTeamPlayers,
  onClose,
  onSubmit,
  isLoading,
}: {
  matchId: string
  teams: Team[]
  homeTeamPlayers: Player[]
  awayTeamPlayers: Player[]
  onClose: () => void
  onSubmit: (data: Partial<Goal>) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    teamId: '',
    playerId: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.teamId || !formData.playerId) return
    
    onSubmit({
      matchId,
      teamId: formData.teamId,
      playerId: formData.playerId,
      quantity: 1,
    })
  }

  const teamOptions = teams.map(t => ({ value: t.id, label: t.name }))
  
  const teamPlayers = formData.teamId === teams[0]?.id 
    ? homeTeamPlayers 
    : formData.teamId === teams[1]?.id 
      ? awayTeamPlayers 
      : []
      
  const playerOptions = teamPlayers.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName} (#${p.shirtNumber})` }))

  return (
    <Card className="mb-6 border-green-500/30">
      <CardHeader>
        <span className="font-bold text-green-800">Agregar Gol</span>
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
              disabled={!formData.teamId}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Agregar Gol
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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

  const teamOptions = teams.map(t => ({ value: t.id, label: t.name }))
  const teamPlayers = players.filter(p => p.teamId === formData.teamId)
  const playerOptions = teamPlayers.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName} (#${p.shirtNumber})` }))

  return (
    <Card className="mb-6 border-green-500/30">
      <CardHeader>
        <span className="font-bold text-green-800">Agregar Tarjeta</span>
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
              disabled={!formData.teamId}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Tipo"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'amarilla', label: 'Amarilla' },
                { value: 'roja', label: 'Roja' },
              ]}
            />
            <Input
              label="Minuto"
              type="number"
              min="1"
              max="120"
              value={formData.minute}
              onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
              placeholder="45"
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

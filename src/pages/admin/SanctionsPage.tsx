import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Button } from '../../components/ui'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui'
import { Input, Select } from '../../components/ui'
import { getTeams, getPlayers, getActiveSanctions, createSanction, updateSanction, deleteSanction, getActiveTournament } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { Team, Sanction, Player, SanctionStatus, SanctionOrigin } from '../../types/domain'

export function SanctionsPage() {
  const { tournamentId } = useTournamentId()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingSanction, setEditingSanction] = useState<Sanction | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Get tournament for threshold
  const { data: tournament } = useQuery({
    queryKey: ['activeTournament'],
    queryFn: getActiveTournament,
  })
  const threshold = tournament?.yellowCardSuspensionThreshold || 3

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeams(tournamentId!),
    enabled: !!tournamentId,
  })

  // Get all players for all teams
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

  // Get all active sanctions
  const { data: activeSanctions = [], isLoading: sanctionsLoading } = useQuery({
    queryKey: ['activeSanctions', tournamentId],
    queryFn: () => getActiveSanctions(),
  })

  const createMutation = useMutation({
    mutationFn: createSanction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSanctions'] })
      queryClient.invalidateQueries({ queryKey: ['allPlayers'] }) // Update yellow cards counts
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sanction> }) => 
      updateSanction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSanctions'] })
      setEditingSanction(null)
      setShowForm(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSanction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSanctions'] })
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

  const filteredSanctions = activeSanctions.filter((s: Sanction) => 
    filterStatus === 'all' || s.status === filterStatus
  )

  const statusOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'vigente', label: 'Vigente' },
    { value: 'cumplida', label: 'Cumplida' },
    { value: 'anulada', label: 'Anulada' },
  ]

  if (sanctionsLoading) {
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
          <h1 className="text-2xl font-semibold text-white">Sanciones</h1>
          <p className="mt-1 text-sm text-slate-400">Gestiona las sanciones de los jugadores</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          Nueva Sanción
        </Button>
      </div>

      {/* Criterios de sanción */}
      <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-yellow-400">📋 Criterios de Sanción</span>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-yellow-400 hover:text-yellow-300"
              onClick={() => window.location.href = '/admin/configuracion'}
            >
              ⚙️ Configurar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-yellow-500/10 p-3">
              <h4 className="font-semibold text-yellow-400 text-sm">🟨 Amarillas (no consecutivas)</h4>
              <p className="text-xs text-yellow-200 mt-1">
                {threshold} amarillas = <strong>1 fecha</strong> (auto)
              </p>
            </div>
            <div className="rounded-lg bg-orange-500/10 p-3">
              <h4 className="font-semibold text-orange-400 text-sm">🟨 Amarillas consecutivas</h4>
              <p className="text-xs text-orange-200 mt-1">
                {tournament?.consecutiveYellowSuspension || 2} en mismo partido = <strong>1 fecha</strong> (auto)
              </p>
            </div>
            <div className="rounded-lg bg-red-500/10 p-3">
              <h4 className="font-semibold text-red-400 text-sm">🟥 Tarjeta Roja</h4>
              <p className="text-xs text-red-200 mt-1">
                {tournament?.redCardSuspensionMatches || 2} fechas de suspensión (auto)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <SanctionForm
          teams={teams}
          players={allPlayers}
          editingSanction={editingSanction}
          onClose={() => {
            setShowForm(false)
            setEditingSanction(null)
          }}
          onSubmit={(data) => {
            if (editingSanction) {
              updateMutation.mutate({ id: editingSanction.id, data })
            } else {
              createMutation.mutate(data as Parameters<typeof createSanction>[0])
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      <Card className="mb-6">
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium">Filtros</span>
        </CardHeader>
        <CardContent>
          <Select
            label="Estado"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={statusOptions}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <span className="font-medium">Sanciones ({filteredSanctions.length})</span>
        </CardHeader>
        <CardContent className="p-0">
          {filteredSanctions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No hay sanciones registradas.
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
                  <TableHeader>Estado</TableHeader>
                  <TableHeader className="text-right">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSanctions.map((sanction: Sanction) => (
                  <TableRow key={sanction.id}>
                    <TableCell className="font-medium">
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
                            : sanction.origin === 'amarillas_consecutivas'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sanction.origin === 'roja' ? 'Roja' : 
                         sanction.origin === 'acumulacion_amarillas' ? 'Amarillas' :
                         sanction.origin === 'amarillas_consecutivas' ? 'Consecutivas' : 'Manual'}
                      </span>
                    </TableCell>
                    <TableCell>{sanction.totalMatches}</TableCell>
                    <TableCell>{sanction.matchesServed}/{sanction.totalMatches}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        sanction.status === 'vigente' 
                          ? 'bg-green-100 text-green-800' 
                          : sanction.status === 'cumplida'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sanction.status === 'vigente' ? 'Vigente' : 
                         sanction.status === 'cumplida' ? 'Cumplida' : 'Anulada'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {sanction.status === 'vigente' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const newMatchesServed = sanction.matchesServed + 1
                              if (newMatchesServed >= sanction.totalMatches) {
                                updateMutation.mutate({
                                  id: sanction.id,
                                  data: { 
                                    matchesServed: newMatchesServed, 
                                    status: 'cumplida' as SanctionStatus 
                                  },
                                })
                              } else {
                                updateMutation.mutate({
                                  id: sanction.id,
                                  data: { matchesServed: newMatchesServed },
                                })
                              }
                            }}
                          >
                            +1 Partido
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSanction(sanction)
                            setShowForm(true)
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(sanction.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
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

function SanctionForm({
  teams,
  players,
  editingSanction,
  onClose,
  onSubmit,
  isLoading,
}: {
  teams: Team[]
  players: Player[]
  editingSanction: Sanction | null
  onClose: () => void
  onSubmit: (data: Partial<Sanction>) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    teamId: editingSanction?.teamId || '',
    playerId: editingSanction?.playerId || '',
    reason: editingSanction?.reason || '',
    origin: editingSanction?.origin || 'manual',
    totalMatches: editingSanction?.totalMatches?.toString() || '1',
    status: editingSanction?.status || 'vigente',
    notes: editingSanction?.notes || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.teamId || !formData.playerId || !formData.reason) return
    
    onSubmit({
      playerId: formData.playerId,
      teamId: formData.teamId,
      reason: formData.reason,
      origin: formData.origin as SanctionOrigin,
      totalMatches: parseInt(formData.totalMatches, 10),
      status: formData.status as SanctionStatus,
      notes: formData.notes || null,
    })
  }

  const teamOptions = teams.map(t => ({ value: t.id, label: t.name }))
  const teamPlayers = players.filter(p => p.teamId === formData.teamId)
  const playerOptions = teamPlayers.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName}` }))
  const originOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'roja', label: 'Tarjeta Roja' },
    { value: 'acumulacion_amarillas', label: 'Acumulación Amarillas' },
    { value: 'amarillas_consecutivas', label: 'Amarillas Consecutivas' },
  ]
  const statusOptions = [
    { value: 'vigente', label: 'Vigente' },
    { value: 'cumplida', label: 'Cumplida' },
    { value: 'anulada', label: 'Anulada' },
  ]

  return (
    <Card className="mb-6">
      <CardHeader>
        <span className="font-medium">{editingSanction ? 'Editar Sanción' : 'Nueva Sanción'}</span>
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
            <Input
              label="Motivo"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Motivo de la sanción"
              required
            />
            <Select
              label="Origen"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value as SanctionOrigin })}
              options={originOptions}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Partidos"
              type="number"
              min="1"
              max="10"
              value={formData.totalMatches}
              onChange={(e) => setFormData({ ...formData, totalMatches: e.target.value })}
              placeholder="1"
              required
            />
            <Select
              label="Estado"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as SanctionStatus })}
              options={statusOptions}
            />
          </div>
          <Input
            label="Notas"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionales (opcional)"
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {editingSanction ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Button } from '../../components/ui'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui'
import { Input, Select } from '../../components/ui'
import { getMatchDays, getMatches, createMatch, updateMatch, getTeams } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { Match, Team, MatchStatus } from '../../types/domain'
import { appRoutes } from '../../utils/routes'

export function MatchesPage() {
  const { id: matchDayId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { tournamentId } = useTournamentId()

  const { data: matchDays = [] } = useQuery({
    queryKey: ['matchDays', tournamentId],
    queryFn: () => getMatchDays(tournamentId!),
    enabled: !!tournamentId,
  })

  const currentMatchDay = matchDays.find(md => md.id === matchDayId)

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches', matchDayId],
    queryFn: () => getMatches(matchDayId!),
    enabled: !!matchDayId,
  })

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeams(tournamentId!),
    enabled: !!tournamentId,
  })

  const createMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', matchDayId] })
      setShowForm(false)
      setSuccess('Partido creado correctamente')
      setError('')
    },
    onError: (err: Error) => {
      console.error('Error creating match:', err)
      setError(err.message)
      setSuccess('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Match> }) =>
      updateMatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', matchDayId] })
      setEditingId(null)
      setSuccess('Partido actualizado correctamente')
      setError('')
    },
    onError: (err: Error) => {
      console.error('Error updating match:', err)
      setError(err.message)
      setSuccess('')
    },
  })

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    return team?.name || 'Equipo desconocido'
  }

  if (isLoading) {
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
          <Button variant="ghost" onClick={() => navigate(appRoutes.adminMatchDays)}>
            ← Volver a Fechas
          </Button>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            Partidos - {currentMatchDay?.title || `Fecha ${currentMatchDay?.number}`}
          </h1>
          <p className="mt-1 text-sm text-slate-400">Gestiona los partidos de esta fecha</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          Nuevo Partido
        </Button>
      </div>

      {showForm && (
        <>
          {success && (
            <div className="mb-4 rounded-lg bg-green-900/50 p-3 text-sm text-green-200">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg bg-red-900/50 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
          <MatchForm
            teams={teams}
            matchDayId={matchDayId!}
            onClose={() => { setShowForm(false); setError(''); setSuccess('') }}
            onSubmit={(data) => createMutation.mutate(data as Parameters<typeof createMatch>[0])}
            isLoading={createMutation.isPending}
          />
        </>
      )}

      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium">Lista de partidos ({matches.length})</span>
        </CardHeader>
        <CardContent className="p-0">
          {matches.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No hay partidos registrados en esta fecha. Crea el primer partido.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Local</TableHeader>
                  <TableHeader>Visitante</TableHeader>
                  <TableHeader>Fecha</TableHeader>
                  <TableHeader>Lugar</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader className="text-right">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {matches.map((match: Match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">{getTeamName(match.homeTeamId)}</TableCell>
                    <TableCell>{getTeamName(match.awayTeamId)}</TableCell>
                    <TableCell>
                      {match.scheduledAt 
                        ? (() => {
                            const date = new Date(match.scheduledAt)
                            date.setHours(date.getHours() + 3)
                            return date.toLocaleString('es-AR', { 
                              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                            })
                          })()
                        : '-'
                      }
                    </TableCell>
                    <TableCell>{match.venue || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        match.status === 'jugado' 
                          ? 'bg-green-100 text-green-800' 
                          : match.status === 'suspendido'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {match.status === 'jugado' ? 'Jugado' : 
                         match.status === 'suspendido' ? 'Suspendido' : 
                         match.status === 'reprogramado' ? 'Reprogramado' : 'Programado'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/fechas/${match.id}/planilla`)}
                        >
                          📋 Planilla
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/fechas/${match.id}/tarjetas`)}
                        >
                          Tarjetas
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(match.id)}
                        >
                          Editar
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

      {editingId && (
        <MatchFormEdit
          match={matches.find(m => m.id === editingId)!}
          teams={teams}
          onClose={() => setEditingId(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingId, data })}
          isLoading={updateMutation.isPending}
        />
      )}
    </section>
  )
}

function MatchForm({
  teams,
  matchDayId,
  onClose,
  onSubmit,
  isLoading,
}: {
  teams: Team[]
  matchDayId: string
  onClose: () => void
  onSubmit: (data: Partial<Match>) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    homeTeamId: '',
    awayTeamId: '',
    scheduledAt: '',
    venue: '',
    status: 'programado',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.homeTeamId === formData.awayTeamId) {
      alert('Los equipos deben ser diferentes')
      return
    }
    onSubmit({
      matchDayId,
      homeTeamId: formData.homeTeamId,
      awayTeamId: formData.awayTeamId,
      scheduledAt: formData.scheduledAt || null,
      venue: formData.venue || null,
      status: formData.status as MatchStatus,
    })
  }

  const libreTeam = teams.find(t => t.name === 'LIBRE')
  let teamOptions = teams.map(t => ({ value: t.id, label: t.name }))
  // Always show LIBRE as option (filter out the actual LIBRE team from list to avoid duplicates)
  teamOptions = teamOptions.filter(t => t.label !== 'LIBRE')
  if (libreTeam) {
    teamOptions = [{ value: libreTeam.id, label: 'LIBRE (Partido no jugado)' }, ...teamOptions]
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <span className="font-medium">Nuevo Partido</span>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Equipo Local"
              value={formData.homeTeamId}
              onChange={(e) => setFormData({ ...formData, homeTeamId: e.target.value })}
              options={teamOptions}
              placeholder="Seleccionar equipo"
              required
            />
            <Select
              label="Equipo Visitante"
              value={formData.awayTeamId}
              onChange={(e) => setFormData({ ...formData, awayTeamId: e.target.value })}
              options={teamOptions}
              placeholder="Seleccionar equipo"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Fecha y hora"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            />
            <Input
              label="Lugar"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="Cancha 1"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Crear Partido
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function MatchFormEdit({
  match,
  teams,
  onClose,
  onSubmit,
  isLoading,
}: {
  match: Match
  teams: Team[]
  onClose: () => void
  onSubmit: (data: Partial<Match>) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState<{
    homeTeamId: string
    awayTeamId: string
    scheduledAt: string
    venue: string
    status: MatchStatus
    homeGoals: string
    awayGoals: string
  }>({
    homeTeamId: match.homeTeamId || '',
    awayTeamId: match.awayTeamId || '',
    scheduledAt: match.scheduledAt ? new Date(match.scheduledAt).toISOString().slice(0, 16) : '',
    venue: match.venue || '',
    status: (match.status || 'programado') as MatchStatus,
    homeGoals: match.homeGoals?.toString() || '',
    awayGoals: match.awayGoals?.toString() || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.homeTeamId === formData.awayTeamId) {
      alert('Los equipos deben ser diferentes')
      return
    }
    onSubmit({
      homeTeamId: formData.homeTeamId,
      awayTeamId: formData.awayTeamId,
      scheduledAt: formData.scheduledAt || null,
      venue: formData.venue || null,
      status: formData.status as MatchStatus,
      homeGoals: formData.homeGoals ? parseInt(formData.homeGoals, 10) : null,
      awayGoals: formData.awayGoals ? parseInt(formData.awayGoals, 10) : null,
    })
  }

  const libreTeam = teams.find(t => t.name === 'LIBRE')
  let teamOptions = teams.map(t => ({ value: t.id, label: t.name }))
  // Always show LIBRE as option
  teamOptions = teamOptions.filter(t => t.label !== 'LIBRE')
  if (libreTeam) {
    teamOptions = [{ value: libreTeam.id, label: 'LIBRE (Partido no jugado)' }, ...teamOptions]
  }

  const statusOptions = [
    { value: 'programado', label: 'Programado' },
    { value: 'reprogramado', label: 'Reprogramado' },
    { value: 'jugado', label: 'Jugado' },
    { value: 'suspendido', label: 'Suspendido' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <span className="font-medium">Editar Partido</span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Equipo Local"
                value={formData.homeTeamId}
                onChange={(e) => setFormData({ ...formData, homeTeamId: e.target.value })}
                options={teamOptions}
                placeholder="Seleccionar equipo"
                required
              />
              <Select
                label="Equipo Visitante"
                value={formData.awayTeamId}
                onChange={(e) => setFormData({ ...formData, awayTeamId: e.target.value })}
                options={teamOptions}
                placeholder="Seleccionar equipo"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Fecha y hora"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
              <Input
                label="Lugar"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Select
                label="Estado"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MatchStatus })}
                options={statusOptions}
              />
              <Input
                label="Goles Local"
                type="number"
                min="0"
                value={formData.homeGoals}
                onChange={(e) => setFormData({ ...formData, homeGoals: e.target.value })}
              />
              <Input
                label="Goles Visitante"
                type="number"
                min="0"
                value={formData.awayGoals}
                onChange={(e) => setFormData({ ...formData, awayGoals: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Guardar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Button } from '../../components/ui'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui'
import { Input } from '../../components/ui'
import { getMatchDays, createMatchDay, updateMatchDay } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { MatchDay } from '../../types/domain'
import { appRoutes } from '../../utils/routes'

export function MatchDaysPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAllDates, setShowAllDates] = useState(false)
  const { tournamentId } = useTournamentId()

  const { data: allMatchDays = [], isLoading } = useQuery({
    queryKey: ['matchDays', tournamentId],
    queryFn: () => getMatchDays(tournamentId!),
    enabled: !!tournamentId,
  })

  // Filtrar fechas: si showAllDates=false, solo mostrar las publicadas
  const matchDays = showAllDates 
    ? allMatchDays 
    : allMatchDays.filter((md: MatchDay) => md.published)

  const createMutation = useMutation({
    mutationFn: ({ data }: { data: Partial<MatchDay> }) => {
      if (!tournamentId) throw new Error('No hay torneo activo')
      return createMatchDay({ ...data, tournamentId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchDays'] })
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MatchDay> }) => 
      updateMatchDay(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchDays'] })
      setEditingId(null)
    },
  })

  const handleToggleVisibility = (id: string, current: boolean) => {
    updateMutation.mutate({
      id,
      data: { visiblePublicly: !current },
    })
  }

  const handleTogglePublish = (id: string, current: boolean) => {
    updateMutation.mutate({
      id,
      data: { published: !current },
    })
  }

  // Mutation para publicar/ocultar todas
  const publishAllMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      if (!tournamentId || allMatchDays.length === 0) return
      // Actualizar cada fecha
      const updates = allMatchDays.map((md: MatchDay) => 
        updateMatchDay(md.id, { published: publish })
      )
      await Promise.all(updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchDays'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      </div>
    )
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={() => navigate(appRoutes.admin)}>
            ← Volver al panel
          </Button>
          <h1 className="mt-2 text-2xl font-semibold text-white">Fechas del Fixture</h1>
          <p className="mt-1 text-sm text-slate-400">Gestiona las fechas y su visibilidad pública</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="secondary" 
            onClick={() => setShowAllDates(!showAllDates)}
            size="sm"
          >
            {showAllDates ? '◀ Ocultar no publicadas' : '▶ Ver todas'}
          </Button>
          {matchDays.length > 0 && (
            <>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => publishAllMutation.mutate(true)}
                isLoading={publishAllMutation.isPending}
              >
                Publicar todas
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => publishAllMutation.mutate(false)}
                isLoading={publishAllMutation.isPending}
              >
                Ocultar todas
              </Button>
            </>
          )}
          <Button onClick={() => setShowForm(true)}>
            Nueva Fecha
          </Button>
        </div>
      </div>

      {/* Formulario de nueva fecha */}
      {showForm && (
        <MatchDayForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createMutation.mutate({ data })}
          isLoading={createMutation.isPending}
        />
      )}

      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium">Lista de fechas ({matchDays.length})</span>
        </CardHeader>
        <CardContent className="p-0">
          {matchDays.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No hay fechas registradas. Crea la primera fecha del torneo.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>#</TableHeader>
                  <TableHeader>Título</TableHeader>
                  <TableHeader>Fecha ref.</TableHeader>
                  <TableHeader>Visible</TableHeader>
                  <TableHeader>Publicada</TableHeader>
                  <TableHeader className="text-right">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {matchDays.map((md: MatchDay) => (
                  <TableRow key={md.id}>
                    <TableCell className="font-medium">{md.number}</TableCell>
                    <TableCell>{md.title || `Fecha ${md.number}`}</TableCell>
                    <TableCell>{md.referenceDate || '-'}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(md.id, md.visiblePublicly)}
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          md.visiblePublicly 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {md.visiblePublicly ? 'Sí' : 'No'}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(md.id, md.published)}
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          md.published 
                            ? 'bg-sky-100 text-sky-800' 
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {md.published ? 'Publicada' : 'Borrador'}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`${appRoutes.adminMatchDays}/${md.id}`)}
                        >
                          Ver partidos
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(md.id)}
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

      {/* Formulario de edición inline */}
      {editingId && (
        <MatchDayFormEdit
          matchDay={matchDays.find((m: MatchDay) => m.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingId, data })}
          isLoading={updateMutation.isPending}
        />
      )}
    </section>
  )
}

function MatchDayForm({ 
  onClose, 
  onSubmit, 
  isLoading 
}: { 
  onClose: () => void
  onSubmit: (data: Partial<MatchDay>) => void
  isLoading: boolean 
}) {
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    referenceDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      number: parseInt(formData.number, 10),
      title: formData.title || null,
      referenceDate: formData.referenceDate || null,
      visiblePublicly: false,
      published: false,
    } as Partial<MatchDay>)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <span className="font-medium">Nueva Fecha</span>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Número"
              type="number"
              min="1"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              placeholder="1"
              required
            />
            <Input
              label="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Fecha 1 - Inaugural"
            />
            <Input
              label="Fecha referencia"
              type="date"
              value={formData.referenceDate}
              onChange={(e) => setFormData({ ...formData, referenceDate: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Crear Fecha
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function MatchDayFormEdit({ 
  matchDay, 
  onClose, 
  onSubmit, 
  isLoading 
}: { 
  matchDay: MatchDay
  onClose: () => void
  onSubmit: (data: Partial<MatchDay>) => void
  isLoading: boolean 
}) {
  const [formData, setFormData] = useState({
    number: matchDay.number.toString(),
    title: matchDay.title || '',
    referenceDate: matchDay.referenceDate || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      number: parseInt(formData.number, 10),
      title: formData.title || null,
      referenceDate: formData.referenceDate || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <span className="font-medium">Editar Fecha {matchDay.number}</span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Número"
                type="number"
                min="1"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                required
              />
              <Input
                label="Título"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Input
                label="Fecha referencia"
                type="date"
                value={formData.referenceDate}
                onChange={(e) => setFormData({ ...formData, referenceDate: e.target.value })}
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
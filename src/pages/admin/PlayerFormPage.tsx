import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Input } from '../../components/ui'
import { Select } from '../../components/ui'
import { Button } from '../../components/ui'
import { getTeams } from '../../services/database'
import { createPlayer } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import { uploadPlayerPhoto, validateImageFile } from '../../lib/storage'
import { appRoutes } from '../../utils/routes'

export function PlayerFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { tournamentId } = useTournamentId()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    teamId: '',
    shirtNumber: '',
    position: '',
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeams(tournamentId!),
    enabled: !!tournamentId,
  })

  const createMutation = useMutation({
    mutationFn: createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      navigate(appRoutes.adminPlayers)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('El nombre y apellido son requeridos')
      return
    }

    if (!formData.teamId) {
      setError('Debes seleccionar un equipo')
      return
    }

    setError('')
    setUploading(true)

    try {
      let photoUrl: string | null = null

      if (photoFile) {
        validateImageFile(photoFile)
        const photoResult = await uploadPlayerPhoto('new', photoFile)
        photoUrl = photoResult.url
      }

      createMutation.mutate({
        team_id: formData.teamId,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        shirt_number: formData.shirtNumber ? parseInt(formData.shirtNumber, 10) : null,
        position: formData.position.trim() || null,
        photo_url: photoUrl,
        active: true,
      } as Parameters<typeof createPlayer>[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir foto')
    } finally {
      setUploading(false)
    }
  }

  const teamOptions = teams.map(t => ({ value: t.id, label: t.name }))

  return (
    <section>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(appRoutes.adminPlayers)}>
          ← Volver a jugadores
        </Button>
        <h1 className="mt-2 text-2xl font-semibold text-white">Nuevo Jugador</h1>
      </div>

      <Card>
        <CardHeader>
          <span className="font-medium">Datos del jugador</span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Juan"
                required
              />

              <Input
                label="Apellido"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Pérez"
                required
              />
            </div>

            <Select
              label="Equipo"
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
              options={teamOptions}
              placeholder="Seleccionar equipo..."
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Número de camiseta"
                type="number"
                min="1"
                max="99"
                value={formData.shirtNumber}
                onChange={(e) => setFormData({ ...formData, shirtNumber: e.target.value })}
                placeholder="10"
              />

              <Input
                label="Posición"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Delantero, Mediocampista, etc."
              />
            </div>

            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-slate-700">
                Foto del jugador (opcional)
              </label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setPhotoFile(f)
                }}
                className="mt-1 block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-sky-50 file:text-sky-700
                  hover:file:bg-sky-100"
              />
              {photoFile && (
                <p className="mt-1 text-xs text-slate-500">Seleccionado: {photoFile.name}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(appRoutes.adminPlayers)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={createMutation.isPending || uploading}
              >
                Crear Jugador
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
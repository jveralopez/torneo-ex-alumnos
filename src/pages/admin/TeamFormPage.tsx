import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Input } from '../../components/ui'
import { Button } from '../../components/ui'
import { createTeam } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import { uploadTeamShield, validateImageFile } from '../../lib/storage'
import { appRoutes } from '../../utils/routes'

export function TeamFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { tournamentId } = useTournamentId()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [shieldFile, setShieldFile] = useState<File | null>(null)
  const [teamPhotoFile, setTeamPhotoFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)

  const createMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      setSuccess('Equipo creado correctamente')
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setTimeout(() => {
        navigate(appRoutes.adminTeams)
      }, 1500)
    },
    onError: (err: Error) => {
      setError(err.message)
      setSuccess('')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('El nombre del equipo es requerido')
      return
    }

    if (!tournamentId) {
      setError('No hay torneo activo configurado')
      return
    }

    setError('')
    setSuccess('')
    setUploading(true)

    try {
      let shieldUrl: string | null = null
      let teamPhotoUrl: string | null = null

      // Upload shield if selected
      if (shieldFile) {
        validateImageFile(shieldFile)
        const shieldResult = await uploadTeamShield('new', shieldFile)
        shieldUrl = shieldResult.url
      }

      // Upload team photo if selected
      if (teamPhotoFile) {
        validateImageFile(teamPhotoFile)
        const photoResult = await uploadTeamShield('new', teamPhotoFile)
        teamPhotoUrl = photoResult.url
      }

      createMutation.mutate({
        tournamentId: tournamentId,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        shieldUrl: shieldUrl,
        teamPhotoUrl: teamPhotoUrl,
        active: true,
      } as Parameters<typeof createTeam>[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivos')
    } finally {
      setUploading(false)
    }
  }

  return (
    <section>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(appRoutes.adminTeams)}>
          ← Volver a equipos
        </Button>
        <h1 className="mt-2 text-2xl font-semibold text-white">Nuevo Equipo</h1>
      </div>

      <Card>
        <CardHeader>
          <span className="font-medium">Datos del equipo</span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="rounded-lg bg-green-900/50 p-3 text-sm text-green-200">
                {success}
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <Input
              label="Nombre del equipo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Los Terribles"
              required
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                Descripción (opcional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descripción del equipo..."
                rows={3}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="shield" className="block text-sm font-medium text-slate-700">
                  Escudo (opcional)
                </label>
                <input
                  id="shield"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setShieldFile(f)
                  }}
                  className="mt-1 block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-sky-50 file:text-sky-700
                    hover:file:bg-sky-100"
                />
                {shieldFile && (
                  <p className="mt-1 text-xs text-slate-500">Seleccionado: {shieldFile.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="teamPhoto" className="block text-sm font-medium text-slate-700">
                  Foto del equipo (opcional)
                </label>
                <input
                  id="teamPhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setTeamPhotoFile(f)
                  }}
                  className="mt-1 block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-sky-50 file:text-sky-700
                    hover:file:bg-sky-100"
                />
                {teamPhotoFile && (
                  <p className="mt-1 text-xs text-slate-500">Seleccionado: {teamPhotoFile.name}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(appRoutes.adminTeams)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={createMutation.isPending || uploading}
              >
                Crear Equipo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

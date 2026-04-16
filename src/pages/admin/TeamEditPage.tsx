import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Input } from '../../components/ui'
import { Button } from '../../components/ui'
import { getTeamById, updateTeam } from '../../services/database'
import { uploadTeamShield, validateImageFile } from '../../lib/storage'
import { appRoutes } from '../../utils/routes'

export function TeamEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [shieldFile, setShieldFile] = useState<File | null>(null)
  const [teamPhotoFile, setTeamPhotoFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id!),
    enabled: !!id,
  })

  // Sync form data when team loads
  if (team && formData.name === '' && formData.description === '') {
    setFormData({
      name: team.name,
      description: team.description || '',
    })
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTeam>[1] }) => 
      updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      navigate(appRoutes.adminTeams)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('El nombre del equipo es requerido')
      return
    }

    setError('')
    setUploading(true)

    try {
      const updateData: Parameters<typeof updateTeam>[1] = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      }

      // Upload new shield if selected
      if (shieldFile) {
        validateImageFile(shieldFile)
        const shieldResult = await uploadTeamShield(id!, shieldFile)
        updateData.shieldUrl = shieldResult.url
      }

      // Upload new team photo if selected
      if (teamPhotoFile) {
        validateImageFile(teamPhotoFile)
        const photoResult = await uploadTeamShield(id!, teamPhotoFile)
        updateData.teamPhotoUrl = photoResult.url
      }

      updateMutation.mutate({
        id: id!,
        data: updateData,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivos')
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="py-12 text-center text-slate-400">
        Equipo no encontrado
      </div>
    )
  }

  return (
    <section>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(appRoutes.adminTeams)}>
          ← Volver a equipos
        </Button>
        <h1 className="mt-2 text-2xl font-semibold text-white">Editar Equipo</h1>
      </div>

      <Card>
        <CardHeader>
          <span className="font-medium">Datos del equipo</span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                {team.shieldUrl && (
                  <img src={team.shieldUrl} alt="Escudo actual" className="mt-2 h-16 w-16 rounded-lg object-cover" />
                )}
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
                  <p className="mt-1 text-xs text-slate-500">Nuevo: {shieldFile.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="teamPhoto" className="block text-sm font-medium text-slate-700">
                  Foto del equipo (opcional)
                </label>
                {team.teamPhotoUrl && (
                  <img src={team.teamPhotoUrl} alt="Foto actual" className="mt-2 h-16 w-16 rounded-lg object-cover" />
                )}
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
                  <p className="mt-1 text-xs text-slate-500">Nuevo: {teamPhotoFile.name}</p>
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
                isLoading={updateMutation.isPending || uploading}
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

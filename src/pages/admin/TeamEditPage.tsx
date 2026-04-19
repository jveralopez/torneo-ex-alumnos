import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Input } from '../../components/ui'
import { Button } from '../../components/ui'
import { getTeamById, updateTeam, getPlayers, createPlayer, updatePlayer, deletePlayer } from '../../services/database'
import { uploadTeamShield, uploadTeamPhoto, validateImageFile } from '../../lib/storage'
import { appRoutes } from '../../utils/routes'
import type { Player } from '../../types/domain'

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
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id!),
    enabled: !!id,
  })

  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ['players', id],
    queryFn: () => getPlayers(id!),
    enabled: !!id,
  })

  const createPlayerMutation = useMutation({
    mutationFn: createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', id] })
      setShowPlayerForm(false)
    },
    onError: (err: Error) => {
      console.error('Error creating player:', err)
      setError(err.message)
    },
  })

  const updatePlayerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Player> }) => 
      updatePlayer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', id] })
      setEditingPlayer(null)
    },
    onError: (err: Error) => {
      console.error('Error updating player:', err)
      setError(err.message)
    },
  })

  const deletePlayerMutation = useMutation({
    mutationFn: deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', id] })
    },
  })

  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [playerForm, setPlayerForm] = useState({
    firstName: '',
    lastName: '',
  })

  const handleSavePlayer = async () => {
    if (!playerForm.firstName.trim() || !playerForm.lastName.trim()) {
      setError('Nombre y apellido son requeridos')
      return
    }
    
    const playerData = {
      teamId: id!,
      firstName: playerForm.firstName,
      lastName: playerForm.lastName,
      active: true,
    }
    
    try {
      if (editingPlayer) {
        await updatePlayerMutation.mutateAsync({ id: editingPlayer.id, data: playerData })
      } else {
        await createPlayerMutation.mutateAsync(playerData)
      }
      
      setPlayerForm({ firstName: '', lastName: '' })
      setShowPlayerForm(false)
      setEditingPlayer(null)
    } catch (err) {
      // Error is already handled in onError callback
      // Keep form open so user can see the error
    }
  }

  // Sync form data when team loads
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description || '',
      })
    }
  }, [team?.id, team?.name, team?.description])

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTeam>[1] }) => 
      updateTeam(id, data),
    onSuccess: (updatedTeam) => {
      console.log('Team updated successfully:', updatedTeam)
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setSuccess('Equipo actualizado correctamente')
      setError('')
    },
    onError: (err: Error) => {
      console.error('Error updating team:', err)
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
        console.log('Uploading shield for team:', id, 'file:', shieldFile.name)
        const shieldResult = await uploadTeamShield(id!, shieldFile)
        console.log('Shield uploaded, URL:', shieldResult.url)
        updateData.shieldUrl = shieldResult.url
      }

      // Upload new team photo if selected
      if (teamPhotoFile) {
        validateImageFile(teamPhotoFile)
        console.log('Uploading team photo for team:', id, 'file:', teamPhotoFile.name)
        const photoResult = await uploadTeamPhoto(id!, teamPhotoFile)
        console.log('Team photo uploaded, URL:', photoResult.url)
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
              onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setSuccess('') }}
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
                onChange={(e) => { setFormData({ ...formData, description: e.target.value }); setSuccess('') }}
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

      {/* Plantel */}
      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium">Plantel ({players.length} jugadores)</span>
          <Button 
            size="sm" 
            onClick={() => setShowPlayerForm(true)}
            disabled={players.length >= 15}
          >
            + Agregar Jugador
          </Button>
        </CardHeader>
        
        {/* Formulario de jugador */}
        {(showPlayerForm || editingPlayer) && (
          <div className="border-b border-slate-200 p-4 bg-slate-50">
            <h4 className="font-medium mb-3">
              {editingPlayer ? 'Editar Jugador' : 'Nuevo Jugador'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombre"
                value={playerForm.firstName}
                onChange={(e) => setPlayerForm({ ...playerForm, firstName: e.target.value })}
                placeholder="Juan"
              />
              <Input
                label="Apellido"
                value={playerForm.lastName}
                onChange={(e) => setPlayerForm({ ...playerForm, lastName: e.target.value })}
                placeholder="Pérez"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm"
                onClick={handleSavePlayer}
                isLoading={createPlayerMutation.isPending || updatePlayerMutation.isPending}
              >
                {editingPlayer ? 'Actualizar' : 'Agregar'}
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => {
                  setShowPlayerForm(false)
                  setEditingPlayer(null)
                  setPlayerForm({ firstName: '', lastName: '' })
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <CardContent className="p-0">
          {playersLoading ? (
            <div className="py-8 text-center text-slate-400">Cargando...</div>
          ) : players.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              No hay jugadores. Agregá el primero.
            </div>
          ) : (
            <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {players.map((player: Player) => (
                <div 
                  key={player.id} 
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {player.firstName} {player.lastName}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => { setEditingPlayer(player); setPlayerForm({ firstName: player.firstName, lastName: player.lastName }) }}
                    >
                      ✏️
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deletePlayerMutation.mutate(player.id)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

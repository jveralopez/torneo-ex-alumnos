import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Button } from '../../components/ui'
import { Input } from '../../components/ui'
import { getActiveTournament, updateTournament } from '../../services/database'
import type { Tournament } from '../../types/domain'

export function SettingsPage() {
  const queryClient = useQueryClient()
  
  const { data: tournament, isLoading } = useQuery({
    queryKey: ['activeTournament'],
    queryFn: getActiveTournament,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tournament> }) =>
      updateTournament(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTournament'] })
      alert('Configuración guardada correctamente')
    },
  })

  const [formData, setFormData] = useState({
    name: '',
    year: '',
    description: '',
    yellowCardSuspensionThreshold: '4',
    consecutiveYellowSuspension: '2',
    redCardSuspensionMatches: '2',
  })

  // Update form when tournament loads
  useEffect(() => {
    if (tournament) {
      setFormData({
        name: tournament.name,
        year: tournament.year.toString(),
        description: tournament.description || '',
        yellowCardSuspensionThreshold: (tournament.yellowCardSuspensionThreshold || 4).toString(),
        consecutiveYellowSuspension: (tournament.consecutiveYellowSuspension || 2).toString(),
        redCardSuspensionMatches: (tournament.redCardSuspensionMatches || 2).toString(),
      })
    }
  }, [tournament])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tournament) return
    
    updateMutation.mutate({
      id: tournament.id,
      data: {
        name: formData.name,
        year: parseInt(formData.year, 10),
        description: formData.description || null,
        yellowCardSuspensionThreshold: parseInt(formData.yellowCardSuspensionThreshold, 10),
        consecutiveYellowSuspension: parseInt(formData.consecutiveYellowSuspension, 10),
        redCardSuspensionMatches: parseInt(formData.redCardSuspensionMatches, 10),
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-green-600" />
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración del Torneo</h1>
        <p className="mt-1 text-sm text-slate-400">Administra la configuración general del torneo</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <span className="font-bold text-green-800">Información General</span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre del Torneo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Año"
                type="number"
                min="2020"
                max="2100"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />
            </div>
            
            <Input
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve descripción del torneo..."
            />

            {/* Rules Section */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h3 className="font-semibold text-green-800">📋 Reglas de Sanción</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Amarillas (no consecutivas)"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.yellowCardSuspensionThreshold}
                  onChange={(e) => setFormData({ ...formData, yellowCardSuspensionThreshold: e.target.value })}
                  helper="Para suspensión automática (ej: 4)"
                />
                <Input
                  label="Amarillas consecutivas"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.consecutiveYellowSuspension}
                  onChange={(e) => setFormData({ ...formData, consecutiveYellowSuspension: e.target.value })}
                  helper="2 amarillas seguidas = suspensión"
                />
              </div>
              
              <Input
                label="Fechas por tarjeta roja"
                type="number"
                min="1"
                max="10"
                value={formData.redCardSuspensionMatches}
                onChange={(e) => setFormData({ ...formData, redCardSuspensionMatches: e.target.value })}
                helper="Fechas de suspensión por roja directa"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={updateMutation.isPending}>
                Guardar Configuración
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-2xl border-yellow-500/30 bg-yellow-500/5">
        <CardHeader>
          <span className="font-bold text-yellow-400">ℹ️ Cómo funcionan las sanciones</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-yellow-200">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-yellow-400">🟨 Amarillas no consecutivas:</span>
              <span>Cuando un jugador acumula {formData.yellowCardSuspensionThreshold} amarillas (no seguidas), se genera automáticamente 1 fecha de sanción.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-yellow-400">🟨 Amarillas consecutivas:</span>
              <span>Si un jugador recibe {formData.consecutiveYellowSuspension} amarillas en el mismo partido, se genera automáticamente 1 fecha de sanción.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-red-400">🟥 Tarjeta roja:</span>
              <span>Genera automáticamente {formData.redCardSuspensionMatches} fechas de suspensión. Se aplica al registrar la roja en la planilla.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Button } from '../../components/ui'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui'
import { getTeams } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { Team } from '../../types/domain'
import { appRoutes } from '../../utils/routes'

interface PlayerWithTeam {
  id: string
  firstName: string
  lastName: string
  shirtNumber: number | null
  position: string | null
  active: boolean
  team: Team
}

export function PlayersPage() {
  const navigate = useNavigate()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const { tournamentId } = useTournamentId()

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeams(tournamentId!),
    enabled: !!tournamentId,
  })

  // Placeholder - would need getPlayers function
  const players: PlayerWithTeam[] = []

  if (teamsLoading) {
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
          <h1 className="text-2xl font-semibold text-white">Jugadores</h1>
          <p className="mt-1 text-sm text-slate-400">Gestiona los jugadores de cada equipo</p>
        </div>
        <Button onClick={() => navigate(appRoutes.adminPlayersNew)}>
          Nuevo Jugador
        </Button>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium">Lista de jugadores ({players.length})</span>
        </CardHeader>
        <CardContent className="p-0">
          {teams.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No hay equipos registrados. Crea primero los equipos.
            </div>
          ) : players.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No hay jugadores registrados. Crea el primero.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>#</TableHeader>
                  <TableHeader>Nombre</TableHeader>
                  <TableHeader>Equipo</TableHeader>
                  <TableHeader>Posición</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader className="text-right">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>{player.shirtNumber || '-'}</TableCell>
                    <TableCell className="font-medium">
                      {player.firstName} {player.lastName}
                    </TableCell>
                    <TableCell>{player.team.name}</TableCell>
                    <TableCell>{player.position || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        player.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {player.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`${appRoutes.adminPlayers}/${player.id}`)}
                        >
                          Editar
                        </Button>
                        {deleteConfirm === player.id ? (
                          <>
                            <Button variant="danger" size="sm">
                              Confirmar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(player.id)}
                          >
                            Eliminar
                          </Button>
                        )}
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
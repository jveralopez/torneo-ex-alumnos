import { useQuery } from '@tanstack/react-query'
import { getActiveTournamentId, clearTournamentCache } from '../services/database'

/**
 * Hook personalizado para obtener el ID del torneo activo.
 * Usa React Query para caching y sincronización.
 * 
 * Uso:
 *   const tournamentId = useTournamentId()
 * 
 * En queries:
 *   const { data } = useQuery({
 *     queryKey: ['teams', tournamentId],
 *     queryFn: () => getTeams(tournamentId),
 *     enabled: !!tournamentId
 *   })
 */
export function useTournamentId() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activeTournamentId'],
    queryFn: getActiveTournamentId,
    staleTime: Infinity, // El tournament ID no cambia durante la sesión
    retry: false,
  })

  return {
    tournamentId: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook para obtener el torneo activo completo
 */
export function useActiveTournament() {
  const { data: tournamentId, isLoading, error, refetch } = useQuery({
    queryKey: ['activeTournamentId'],
    queryFn: getActiveTournamentId,
    staleTime: Infinity,
  })

  return {
    tournamentId,
    isLoading,
    error,
    refetch,
  }
}

// Re-export para方便
export { clearTournamentCache }

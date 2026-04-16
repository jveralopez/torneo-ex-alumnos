import { getSupabaseClient } from '../lib/supabase'
import { env } from '../lib/env'
import { 
  demoTeams, 
  demoPlayers, 
  demoMatches,
  demoTournament,
  getDemoMatchDays,
  getDemoVisibleMatchDays,
  getDemoMatches,
  getDemoPlayedMatches,
  getDemoRecentPlayedMatches,
  getDemoNextMatchDay,
  getDemoPublicSanctions,
  getDemoGoalsByPlayer,
  getDemoYellowCardsByPlayer,
  getDemoDocuments,
  getDemoAllPlayedMatchesWithTeams,
  getDemoYellowCardsInLastMatchDay
} from '../lib/demoData'
import type { 
  Tournament, 
  Team, 
  Player, 
  MatchDay, 
  Match, 
  Goal, 
  Card, 
  Sanction, 
  Document,
  AdminUser 
} from '../types/domain'

// Cache para el ID del torneo activo (se resetea en cada sesión)
let cachedTournamentId: string | null = null
let cachedTournamentLoading: Promise<string> | null = null

/**
 * Obtiene el ID del torneo activo. 
 * Usa cache en memoria para evitar consultas repetidas.
 * IMPORTANTE: En desarrollo, si no hay torneo activo, retorna 'dev-tournament'
 * para permitir probar sin tener datos en Supabase.
 */
export async function getActiveTournamentId(): Promise<string> {
  // En modo demo, retornar ID de demo
  if (env.demoMode) {
    return 'demo-tournament'
  }
  
  // Si ya tenemos el ID cacheado, retornarlo
  if (cachedTournamentId) return cachedTournamentId
  
  // Si hay una consulta en progreso, esperar
  if (cachedTournamentLoading) {
    return cachedTournamentLoading
  }
  
  // Iniciar consulta
  const queryPromise = (async (): Promise<string> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('tournament')
      .select('id')
      .eq('status', 'activo')
      .limit(1)
      .single()
    
    if (error || !data) {
      // En desarrollo, usar ID por defecto si no hay torneo activo
      // Esto permite probar la app sin datos en Supabase
      if (import.meta.env.DEV || !error) {
        const devId = 'dev-tournament'
        cachedTournamentId = devId
        return devId
      }
      throw new Error('No hay torneo activo configurado')
    }
    
    cachedTournamentId = data.id
    return data.id
  })()
  
  cachedTournamentLoading = queryPromise
  return queryPromise
}

/**
 * Fuerza清除 el cache del tournament ID.
 * Útil para cuando se cambia de torneo o para testing.
 */
export function clearTournamentCache(): void {
  cachedTournamentId = null
  cachedTournamentLoading = null
}

// Tournament
export async function getTournaments(): Promise<Tournament[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('tournament')
    .select('*')
    .order('year', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getActiveTournament(): Promise<Tournament | null> {
  // En modo demo, retornar torneo de demo
  if (env.demoMode) {
    return demoTournament
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('tournament')
    .select('*')
    .eq('status', 'activo')
    .limit(1)
    .single()
  
  if (error) return null
  return data
}

export async function updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament> {
  // En modo demo, actualizar el torneo de demo
  if (env.demoMode) {
    const { demoTournament } = await import('../lib/demoData')
    // Update demo tournament in memory (temporary)
    Object.assign(demoTournament, data)
    return demoTournament as Tournament
  }
  
  const supabase = getSupabaseClient()
  const { data: updated, error } = await supabase
    .from('tournament')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return updated
}

// Team
export async function getTeams(tournamentId: string): Promise<Team[]> {
  // En modo demo, retornar equipos de demo
  if (env.demoMode) {
    return demoTeams
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('team')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('active', true)
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function getTeamById(id: string): Promise<Team | null> {
  // En modo demo
  if (env.demoMode) {
    return demoTeams.find(t => t.id === id) || null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('team')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createTeam(team: Partial<Team>): Promise<Team> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('team')
    .insert(team)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTeam(id: string, team: Partial<Team>): Promise<Team> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('team')
    .update(team)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteTeam(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('team')
    .update({ active: false })
    .eq('id', id)
  
  if (error) throw error
}

// Player
export async function getPlayers(teamId: string): Promise<Player[]> {
  // En modo demo
  if (env.demoMode) {
    if (teamId === 'demo-tournament') {
      return demoPlayers
    }
    return demoPlayers.filter(p => p.teamId === teamId)
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('player')
    .select('*')
    .eq('team_id', teamId)
    .eq('active', true)
    .order('shirt_number')
  
  if (error) throw error
  return data || []
}

export async function createPlayer(player: Partial<Player>): Promise<Player> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('player')
    .insert(player)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updatePlayer(id: string, player: Partial<Player>): Promise<Player> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('player')
    .update(player)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Match Day
export async function getMatchDays(tournamentId: string): Promise<MatchDay[]> {
  if (env.demoMode) {
    return getDemoMatchDays()
  }
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('match_day')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('number')
  
  if (error) throw error
  return data || []
}

export async function getVisibleMatchDays(tournamentId: string): Promise<MatchDay[]> {
  if (env.demoMode) {
    return getDemoVisibleMatchDays()
  }
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('match_day')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('visible_publicly', true)
    .order('number')
  
  if (error) throw error
  return data || []
}

export async function createMatchDay(matchDay: Partial<MatchDay>): Promise<MatchDay> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('match_day')
    .insert(matchDay)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateMatchDay(id: string, matchDay: Partial<MatchDay>): Promise<MatchDay> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('match_day')
    .update(matchDay)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Match
export async function getMatches(matchDayId: string): Promise<Match[]> {
  if (env.demoMode) {
    return getDemoMatches(matchDayId) as Match[]
  }
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('match')
    .select('*')
    .eq('match_day_id', matchDayId)
  
  if (error) throw error
  return data || []
}

export async function getMatchById(id: string): Promise<Match | null> {
  if (env.demoMode) {
    return demoMatches.find(m => m.id === id) as Match | null || null
  }
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('match')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function updateMatch(id: string, match: Partial<Match>): Promise<Match> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('match')
    .update(match)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createMatch(match: Partial<Match>): Promise<Match> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('match')
    .insert(match)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Goals
export async function getGoals(matchId: string): Promise<Goal[]> {
  // En modo demo
  if (env.demoMode) {
    const { demoGoals } = await import('../lib/demoData')
    return demoGoals.filter(g => g.matchId === matchId) as Goal[]
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('goal')
    .select('*')
    .eq('match_id', matchId)
  
  if (error) throw error
  return data || []
}

export async function getGoalsByMatch(matchId: string): Promise<Goal[]> {
  return getGoals(matchId)
}

export async function getGoalsByTeam(teamId: string): Promise<Goal[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('goal')
    .select('*')
    .eq('team_id', teamId)
  
  if (error) throw error
  return data || []
}

export async function createGoal(goal: Partial<Goal>): Promise<Goal> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('goal')
    .insert(goal)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteGoal(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('goal')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getTopScorers(_tournamentId: string): Promise<Array<Goal & { player: Player; team: Team }>> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('goal')
    .select(`
      *,
      player:player_id(id, first_name, last_name, photo_url, shirt_number),
      team:team_id(id, name)
    `)
    .order('quantity', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Get goals aggregated by player
export async function getGoalsByPlayer(tournamentId: string): Promise<Array<{ player: Player; team: Team; totalGoals: number }>> {
  // En modo demo, retornar datos de demo
  if (env.demoMode) {
    return getDemoGoalsByPlayer() as Array<{ player: Player; team: Team; totalGoals: number }>
  }
  
  const supabase = getSupabaseClient()
  
  // First get teams for this tournament
  const { data: teams, error: teamsError } = await supabase
    .from('team')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('active', true)
  
  if (teamsError) throw teamsError
  if (!teams || teams.length === 0) return []
  
  const teamIds = teams.map(t => t.id)
  
  const { data, error } = await supabase
    .from('goal')
    .select('*, player:player_id(*), team:team_id(*)')
    .in('team_id', teamIds)
  
  if (error) throw error
  
  // Aggregate goals by player - simple approach with unknown first
  const goalsMap = new Map<string, { player: Player; team: Team; totalGoals: number }>()
  
  const typedData = data as unknown as Array<{ player: Player; team: Team; quantity: number }>
  
  typedData?.forEach((goal) => {
    if (!goal.player?.id) return
    
    const playerId = goal.player.id
    const existing = goalsMap.get(playerId)
    const qty = goal.quantity || 1
    
    if (existing) {
      existing.totalGoals += qty
    } else {
      goalsMap.set(playerId, {
        player: goal.player,
        team: goal.team,
        totalGoals: qty,
      })
    }
  })
  
  return Array.from(goalsMap.values()).sort((a, b) => b.totalGoals - a.totalGoals)
}

// Get all played matches for results
export async function getPlayedMatches(tournamentId: string): Promise<Match[]> {
  if (env.demoMode) {
    return getDemoPlayedMatches() as Match[]
  }
  const supabase = getSupabaseClient()
  
  const { data: matchDays, error: mdError } = await supabase
    .from('match_day')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('visible_publicly', true)
  
  if (mdError) throw mdError
  if (!matchDays || matchDays.length === 0) return []
  
  const matchDayIds = matchDays.map(md => md.id)
  
  const { data, error } = await supabase
    .from('match')
    .select('*')
    .in('match_day_id', matchDayIds)
    .eq('status', 'jugado')
  
  if (error) throw error
  return data || []
}

// Get next visible match day (not played yet)
export async function getNextMatchDay(tournamentId: string): Promise<MatchDay | null> {
  if (env.demoMode) {
    return getDemoNextMatchDay() as MatchDay | null
  }
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('match_day')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('visible_publicly', true)
    .neq('status', 'finalizado')
    .order('number')
    .limit(1)
    .single()
  
  if (error) return null
  return data
}

// Get recent played matches (last 5)
export async function getRecentPlayedMatches(tournamentId: string, limit: number = 5): Promise<Match[]> {
  if (env.demoMode) {
    return getDemoRecentPlayedMatches(limit) as Match[]
  }
  const supabase = getSupabaseClient()
  
  const { data: matchDays } = await supabase
    .from('match_day')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('visible_publicly', true)
  
  if (!matchDays || matchDays.length === 0) return []
  
  const matchDayIds = matchDays.map(md => md.id)
  
  const { data, error } = await supabase
    .from('match')
    .select('*')
    .in('match_day_id', matchDayIds)
    .eq('status', 'jugado')
    .order('updated_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

// Get active sanctions for public display
export async function getPublicSanctions(tournamentId: string): Promise<Sanction[]> {
  if (env.demoMode) {
    return getDemoPublicSanctions() as Sanction[]
  }
  const supabase = getSupabaseClient()
  
  const { data: teams } = await supabase
    .from('team')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('active', true)
  
  if (!teams || teams.length === 0) return []
  
  const teamIds = teams.map(t => t.id)
  
  const { data, error } = await supabase
    .from('sanction')
    .select('*')
    .in('team_id', teamIds)
    .eq('status', 'vigente')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Get all played matches with team info for standings calculation
export async function getAllPlayedMatchesWithTeams(tournamentId: string): Promise<Match[]> {
  // En modo demo, retornar partidos jugados de demo
  if (env.demoMode) {
    return getDemoAllPlayedMatchesWithTeams() as Match[]
  }
  
  const supabase = getSupabaseClient()
  
  // First get match days for this tournament
  const { data: matchDays, error: mdError } = await supabase
    .from('match_day')
    .select('id')
    .eq('tournament_id', tournamentId)
  
  if (mdError) throw mdError
  if (!matchDays || matchDays.length === 0) return []
  
  const matchDayIds = matchDays.map(md => md.id)
  
  const { data, error } = await supabase
    .from('match')
    .select(`
      *,
      home_team:home_team_id(name),
      away_team:away_team_id(name)
    `)
    .in('match_day_id', matchDayIds)
    .eq('status', 'jugado')
  
  if (error) throw error
  return data || []
}

// Get matches for a specific team
export async function getMatchesByTeam(teamId: string): Promise<Match[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('match')
    .select('*')
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Cards
export async function getCards(matchId: string): Promise<Card[]> {
  // En modo demo
  if (env.demoMode) {
    const { demoCards } = await import('../lib/demoData')
    return demoCards.filter(c => c.matchId === matchId) as Card[]
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('card')
    .select('*')
    .eq('match_id', matchId)
  
  if (error) throw error
  return data || []
}

export async function createCard(card: Partial<Card>): Promise<Card> {
  // En modo demo
  if (env.demoMode) {
    const { demoCards } = await import('../lib/demoData')
    const newCard: Card = {
      id: `card-demo-${Date.now()}`,
      matchId: card.matchId!,
      playerId: card.playerId!,
      teamId: card.teamId!,
      type: card.type!,
      minute: card.minute ?? null,
      createdAt: new Date().toISOString(),
    }
    demoCards.push(newCard)
    
    // Check for automatic sanction in demo mode
    await checkAndCreateAutomaticSanction(newCard.playerId, newCard.type, newCard.matchId)
    
    return newCard
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('card')
    .insert(card)
    .select()
    .single()
  
  if (error) throw error
  
  // After creating the card, check if player should be automatically suspended
  if (data) {
    await checkAndCreateAutomaticSanction(data.playerId, data.type, data.matchId)
  }
  
  return data
}

export async function deleteCard(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('card')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Get all yellow cards for a tournament grouped by player
export async function getYellowCardsByPlayer(tournamentId: string): Promise<Array<{ playerId: string; count: number }>> {
  const supabase = getSupabaseClient()
  
  // Get all match days for tournament
  const { data: matchDays } = await supabase
    .from('match_day')
    .select('id')
    .eq('tournament_id', tournamentId)
  
  if (!matchDays || matchDays.length === 0) return []
  
  const matchDayIds = matchDays.map(md => md.id)
  
  // Get matches in those days
  const { data: matches } = await supabase
    .from('match')
    .select('id')
    .in('match_day_id', matchDayIds)
  
  if (!matches || matches.length === 0) return []
  
  const matchIds = matches.map(m => m.id)
  
  // Get yellow cards for those matches
  const { data: cards, error } = await supabase
    .from('card')
    .select('player_id')
    .in('match_id', matchIds)
    .eq('type', 'amarilla')
  
  if (error) throw error
  
  // Count by player
  const countMap = new Map<string, number>()
  cards?.forEach((card) => {
    const playerId = card.player_id
    countMap.set(playerId, (countMap.get(playerId) || 0) + 1)
  })
  
  return Array.from(countMap.entries()).map(([playerId, count]) => ({ playerId, count }))
}

// Get yellow cards from the LAST played match day only
export async function getYellowCardsInLastMatchDay(tournamentId: string): Promise<Array<{ playerId: string; count: number; matchId: string }>> {
  if (env.demoMode) {
    const { demoCards, demoMatchDays } = await import('../lib/demoData')
    // Find last played match day
    const lastPlayedMatchDay = [...demoMatchDays].reverse().find(md => {
      const matches = demoMatches.filter(m => m.matchDayId === md.id && m.status === 'jugado')
      return matches.length > 0
    })
    if (!lastPlayedMatchDay) return []
    
    const lastPlayedMatchIds = demoMatches
      .filter(m => m.matchDayId === lastPlayedMatchDay.id && m.status === 'jugado')
      .map(m => m.id)
    
    const lastMatchDayCards = demoCards.filter(c => 
      lastPlayedMatchIds.includes(c.matchId) && c.type === 'amarilla'
    )
    
    return lastMatchDayCards.map(c => ({ playerId: c.playerId, count: 1, matchId: c.matchId }))
  }
  
  const supabase = getSupabaseClient()
  
  // Get match days for tournament, find the last one with played matches
  const { data: matchDays } = await supabase
    .from('match_day')
    .select('id, number')
    .eq('tournament_id', tournamentId)
    .order('number', { ascending: false })
  
  if (!matchDays || matchDays.length === 0) return []
  
  // Find last match day with played matches
  for (const md of matchDays) {
    const { data: matches } = await supabase
      .from('match')
      .select('id')
      .eq('match_day_id', md.id)
      .eq('status', 'jugado')
      .limit(1)
    
    if (matches && matches.length > 0) {
      // Get yellow cards from this match day
      const matchIds = (await supabase
        .from('match')
        .select('id')
        .eq('match_day_id', md.id)
        .eq('status', 'jugado')
      ).data?.map(m => m.id) || []
      
      if (matchIds.length === 0) return []
      
      const { data: cards } = await supabase
        .from('card')
        .select('player_id, match_id')
        .in('match_id', matchIds)
        .eq('type', 'amarilla')
      
      return cards?.map(c => ({ playerId: c.player_id, count: 1, matchId: c.match_id })) || []
    }
  }
  
  return []
}

// Sanctions
export async function getActiveSanctions(): Promise<Sanction[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sanction')
    .select('*')
    .eq('status', 'vigente')
  
  if (error) throw error
  return data || []
}

export async function getSanctionsByPlayer(playerId: string): Promise<Sanction[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sanction')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createSanction(sanction: Partial<Sanction>): Promise<Sanction> {
  // En modo demo
  if (env.demoMode) {
    const { demoSanctions } = await import('../lib/demoData')
    const newSanction: Sanction = {
      id: `sanction-demo-${Date.now()}`,
      playerId: sanction.playerId!,
      teamId: sanction.teamId!,
      reason: sanction.reason!,
      totalMatches: sanction.totalMatches!,
      matchesServed: sanction.matchesServed ?? 0,
      status: sanction.status ?? 'vigente',
      origin: sanction.origin ?? 'manual',
      notes: sanction.notes ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    demoSanctions.push(newSanction)
    return newSanction
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sanction')
    .insert(sanction)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Verifica si un jugador debe ser sancionado automáticamente
 * y crea la sanción si corresponde.
 * Se llama cuando se crea una tarjeta (amarilla o roja)
 */
async function checkAndCreateAutomaticSanction(playerId: string, cardType: 'amarilla' | 'roja', matchId?: string): Promise<void> {
  // Get the active tournament to get the thresholds
  const tournament = await getActiveTournament()
  if (!tournament) return
  
  const yellowThreshold = tournament.yellowCardSuspensionThreshold || 4
  const consecutiveThreshold = tournament.consecutiveYellowSuspension || 2
  const redSuspensionMatches = tournament.redCardSuspensionMatches || 2
  
  // Get player info to find the team
  const teams = await getTeams(tournament.id)
  let playerTeamId: string | null = null
  for (const team of teams) {
    const players = await getPlayers(team.id)
    if (players.some(p => p.id === playerId)) {
      playerTeamId = team.id
      break
    }
  }
  if (!playerTeamId) return
  
  // Get active sanctions for this player
  const activeSanctions = await getActiveSanctions()
  
  // ===== RED CARD =====
  if (cardType === 'roja') {
    // Check if player already has an active red card sanction
    const hasExistingRedSanction = activeSanctions.some(s => 
      s.playerId === playerId && s.origin === 'roja'
    )
    
    if (!hasExistingRedSanction) {
      await createSanction({
        playerId,
        teamId: playerTeamId,
        reason: 'Tarjeta roja directa',
        totalMatches: redSuspensionMatches,
        matchesServed: 0,
        status: 'vigente',
        origin: 'roja',
        notes: `Suspensión automática por tarjeta roja directa (${redSuspensionMatches} fechas)`,
      })
      console.log(`Sanción automática por roja creada para jugador ${playerId}: ${redSuspensionMatches} fechas`)
    }
    return
  }
  
  // ===== YELLOW CARD =====
  // Get all yellow cards for this player
  const yellowCards = await getYellowCardsByPlayer(tournament.id)
  const playerYellowCards = yellowCards.find(y => y.playerId === playerId)
  const totalYellows = playerYellowCards?.count || 0
  
  // 1. Check consecutive yellow cards (same match)
  if (matchId) {
    const cards = await getCards(matchId)
    const playerCardsInMatch = cards.filter(c => c.playerId === playerId && c.type === 'amarilla')
    
    // Check if player already has a consecutive yellow sanction
    const hasExistingConsecutiveSanction = activeSanctions.some(s => 
      s.playerId === playerId && s.origin === 'amarillas_consecutivas'
    )
    
    if (playerCardsInMatch.length >= consecutiveThreshold && !hasExistingConsecutiveSanction) {
      await createSanction({
        playerId,
        teamId: playerTeamId,
        reason: `${consecutiveThreshold} tarjetas amarillas en el mismo partido`,
        totalMatches: 1,
        matchesServed: 0,
        status: 'vigente',
        origin: 'amarillas_consecutivas',
        notes: `Suspensión automática por ${consecutiveThreshold} amarillas consecutivas en un mismo partido`,
      })
      console.log(`Sanción automática por amarillas consecutivas creada para jugador ${playerId}`)
    }
  }
  
  // 2. Check non-consecutive yellow cards (total in tournament)
  // Check if player already has a non-consecutive yellow sanction
  const hasExistingNonConsecutiveSanction = activeSanctions.some(s => 
    s.playerId === playerId && s.origin === 'acumulacion_amarillas'
  )
  
  if (totalYellows >= yellowThreshold && !hasExistingNonConsecutiveSanction) {
    await createSanction({
      playerId,
      teamId: playerTeamId,
      reason: `Acumulación de ${totalYellows} tarjetas amarillas`,
      totalMatches: 1,
      matchesServed: 0,
      status: 'vigente',
      origin: 'acumulacion_amarillas',
      notes: `Suspensión automática al acumular ${totalYellows} amarillas no consecutivas (umbral: ${yellowThreshold})`,
    })
    console.log(`Sanción automática por amarillas no consecutivas creada para jugador ${playerId}: ${totalYellows} amarillas`)
  }
}

export async function updateSanction(id: string, sanction: Partial<Sanction>): Promise<Sanction> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sanction')
    .update(sanction)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteSanction(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('sanction')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Get players near suspension with additional data about last match day cards
export async function getPlayersNearSuspension(tournamentId: string, threshold: number): Promise<Array<{ 
  player: Player; 
  team: Team; 
  yellowCards: number; 
  yellowCardsInLastMatch: number;
  status: 'normal' | 'observation' | 'at_limit'
}>> {
  // En modo demo
  if (env.demoMode) {
    const yellowCardsData = getDemoYellowCardsByPlayer()
    const lastMatchDayCards = getDemoYellowCardsInLastMatchDay()
    const sanctions = getDemoPublicSanctions()
    const suspendedPlayerIds = new Set(sanctions.map(s => s.playerId))
    
    const result = demoPlayers.map(player => {
      const team = demoTeams.find(t => t.id === player.teamId)
      const yellowCount = yellowCardsData.find(y => y.playerId === player.id)?.count || 0
      const yellowInLast = lastMatchDayCards.filter(y => y.playerId === player.id).length
      const isSuspended = suspendedPlayerIds.has(player.id)
      
      // No mostrar suspendidos en observación - aparecen en Sanciones
      if (isSuspended) {
        return null // filtered out
      }
      
      let status: 'normal' | 'observation' | 'at_limit'
      
      // En límite: threshold - 1 o más (ej: 3 si threshold es 4)
      if (yellowCount >= threshold - 1) {
        status = 'at_limit'
      }
      // Observación: 1+ en última fecha (si recibe otra, será suspendido por consecutivas)
      else if (yellowInLast >= 1) {
        status = 'observation'
      }
      else {
        status = 'normal'
      }
      
      return {
        player,
        team: team!,
        yellowCards: yellowCount,
        yellowCardsInLastMatch: yellowInLast,
        status,
      }
    }).filter((p): p is NonNullable<typeof p> => p !== null).sort((a, b) => (b?.yellowCards ?? 0) - (a?.yellowCards ?? 0))
    
    return result as Array<{ 
      player: Player; 
      team: Team; 
      yellowCards: number;
      yellowCardsInLastMatch: number;
      status: 'normal' | 'observation' | 'at_limit'
    }>
  }
  
  const supabase = getSupabaseClient()
  
  // Get teams for this tournament first
  const { data: teams, error: teamsError } = await supabase
    .from('team')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('active', true)
  
  if (teamsError) throw teamsError
  if (!teams || teams.length === 0) return []
  
  const teamIds = teams.map(t => t.id)
  
  // Get yellow cards by player (filtered by tournament)
  const yellowCards = await getYellowCardsByPlayer(tournamentId)
  
  // Get yellow cards from last match day
  const yellowCardsInLastMatch = await getYellowCardsInLastMatchDay(tournamentId)
  
  // Get players with their teams (filtered by tournament teams)
  const { data: players } = await supabase
    .from('player')
    .select('*, team:team_id(*)')
    .in('team_id', teamIds)
    .eq('active', true)
  
  if (!players) return []
  
  // Get active sanctions (suspended players)
  const { data: sanctions } = await supabase
    .from('sanction')
    .select('player_id')
    .eq('status', 'vigente')
  
  const suspendedPlayerIds = new Set(sanctions?.map(s => s.player_id) || [])
  
  // Build result - NO incluye suspendidos (van a Sanciones)
  const result: Array<{ player: Player; team: Team; yellowCards: number; yellowCardsInLastMatch: number; status: 'normal' | 'observation' | 'at_limit' }> = []
  
  players.forEach((player) => {
    const yellowCount = yellowCards.find(y => y.playerId === player.id)?.count || 0
    const yellowInLast = yellowCardsInLastMatch.filter(y => y.playerId === player.id).length
    const isSuspended = suspendedPlayerIds.has(player.id)
    
    // No mostrar suspendados en observación - aparecen en Sanciones
    if (isSuspended) {
      return
    }
    
    let status: 'normal' | 'observation' | 'at_limit'
    
    // En límite: threshold - 1 o más acumuladas (ej: 3 si threshold es 4)
    if (yellowCount >= threshold - 1) {
      status = 'at_limit'
    }
    // Observación: 1+ en última fecha (si recibe otra, será suspendido por consecutivas)
    else if (yellowInLast >= 1) {
      status = 'observation'
    }
    else {
      status = 'normal'
    }
    
    result.push({
      player,
      team: player.team,
      yellowCards: yellowCount,
      yellowCardsInLastMatch: yellowInLast,
      status,
    })
  })
  
  // Sort by yellow cards descending
  return result.sort((a, b) => b.yellowCards - a.yellowCards)
}

// Statistics
export async function getTournamentStats(tournamentId: string): Promise<{
  teams: number
  players: number
  matchesPlayed: number
  matchesTotal: number
  goalsTotal: number
  yellowCardsTotal: number
  redCardsTotal: number
}> {
  const supabase = getSupabaseClient()
  
  // Get teams count
  const { count: teamsCount } = await supabase
    .from('team')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', tournamentId)
    .eq('active', true)
  
  // Get players count
  const { count: playersCount } = await supabase
    .from('player')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)
  
  // Get match days
  const { data: matchDays } = await supabase
    .from('match_day')
    .select('id')
    .eq('tournament_id', tournamentId)
  
  const matchDayIds = matchDays?.map(md => md.id) || []
  
  // Get matches
  const { data: matches } = await supabase
    .from('match')
    .select('id, status')
    .in('match_day_id', matchDayIds)
  
  const matchIds = matches?.map(m => m.id) || []
  const matchesPlayed = matches?.filter(m => m.status === 'jugado').length || 0
  
  // Get goals
  const { count: goalsCount } = await supabase
    .from('goal')
    .select('*', { count: 'exact', head: true })
    .in('match_id', matchIds)
  
  // Get yellow cards
  const { count: yellowCardsCount } = await supabase
    .from('card')
    .select('*', { count: 'exact', head: true })
    .in('match_id', matchIds)
    .eq('type', 'amarilla')
  
  // Get red cards
  const { count: redCardsCount } = await supabase
    .from('card')
    .select('*', { count: 'exact', head: true })
    .in('match_id', matchIds)
    .eq('type', 'roja')
  
  return {
    teams: teamsCount || 0,
    players: playersCount || 0,
    matchesPlayed,
    matchesTotal: matches?.length || 0,
    goalsTotal: goalsCount || 0,
    yellowCardsTotal: yellowCardsCount || 0,
    redCardsTotal: redCardsCount || 0,
  }
}

// Documents
export async function getActiveDocuments(tournamentId: string): Promise<Document[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('document')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('active', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getRegulation(tournamentId: string): Promise<Document | null> {
  // En modo demo, retornar documento de demo
  if (env.demoMode) {
    const docs = getDemoDocuments()
    return docs.find(d => d.type === 'reglamento') || null
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('document')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('type', 'reglamento')
    .eq('active', true)
    .limit(1)
    .single()
  
  if (error) return null
  return data
}

export async function createDocument(doc: Partial<Document>): Promise<Document> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('document')
    .insert(doc)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateDocument(id: string, doc: Partial<Document>): Promise<Document> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('document')
    .update(doc)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteDocument(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('document')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Admin Users
export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('admin_user')
    .select('*')
    .eq('active', true)
    .order('name')
  
  if (error) throw error
  return data || []
}
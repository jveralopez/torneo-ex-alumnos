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
  CardType,
  Sanction, 
  Document,
  AdminUser,
  News,
  NewsType,
  MatchStatus,
  TournamentStatus
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
  if (cachedTournamentId) {
    console.log('getActiveTournamentId - returning cached:', cachedTournamentId)
    return cachedTournamentId
  }

  console.log('getActiveTournamentId - querying Supabase...')
  
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
      console.error('getActiveTournamentId ERROR:', error)
      // Intentar buscar cualquier tournament
      const { data: anyTournament } = await supabase
        .from('tournament')
        .select('id')
        .limit(1)
        .single()
      
      if (anyTournament) {
        console.log('Usando primer tournament:', anyTournament.id)
        cachedTournamentId = anyTournament.id
        return anyTournament.id
      }
      
      throw new Error('No hay tournament: ' + error?.message)
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

async function getDbRecordForAudit(supabase: ReturnType<typeof getSupabaseClient>, tableName: string, recordId: string): Promise<Record<string, unknown> | null> {
  try {
    const { data } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', recordId)
      .single()

    return (data as Record<string, unknown>) || null
  } catch {
    return null
  }
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

// Admin Users - CRUD
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

export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('admin_user')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createAdminUser(user: {
  name: string
  email: string
  role?: 'admin' | 'carga_datos'
}): Promise<AdminUser> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('admin_user')
    .insert({
      name: user.name,
      email: user.email,
      role: user.role || 'carga_datos',
      active: true
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Audit log
  await createAuditLog({
    tableName: 'admin_user',
    recordId: data.id,
    action: 'create',
    newValues: { name: user.name, email: user.email, role: user.role },
    description: `Crear usuario admin: ${user.email}`
  })
  
  return data
}

export async function updateAdminUser(id: string, data: {
  name?: string
  role?: 'admin' | 'carga_datos'
  active?: boolean
}): Promise<AdminUser> {
  const supabase = getSupabaseClient()
  const { data: updated, error } = await supabase
    .from('admin_user')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  
  // Audit log
  await createAuditLog({
    tableName: 'admin_user',
    recordId: id,
    action: 'update',
    newValues: data,
    description: `Actualizar usuario admin: ${updated.email}`
  })
  
  return updated
}

export async function deleteAdminUser(id: string): Promise<void> {
  // Soft delete - deactivate
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('admin_user')
    .update({ active: false })
    .eq('id', id)
  
  if (error) throw error
  
  // Audit log
  await createAuditLog({
    tableName: 'admin_user',
    recordId: id,
    action: 'delete',
    description: `Desactivar usuario admin`
  })
}

export async function getActiveTournament(): Promise<Tournament | null> {
  // En modo demo, retornar torneo de demo
  if (env.demoMode) {
    return demoTournament
  }
  
  const supabase = getSupabaseClient()
  console.log('getActiveTournament - buscando...')
  const { data, error } = await supabase
    .from('tournament')
    .select('*')
    .eq('status', 'activo')
    .limit(1)
    .single()
  
  console.log('getActiveTournament - resultado:', data, 'error:', error)
  
  if (error) {
    // Intentar cualquier tournament
    console.log('Buscando cualquier tournament...')
    const { data: anyData } = await supabase
      .from('tournament')
      .select('*')
      .limit(1)
      .single()
    
    console.log('Cualquier tournament:', anyData)
    return anyData ? normalizeTournamentFromDB([anyData as Record<string, unknown>])[0] : null
  }
  return normalizeTournamentFromDB([data as Record<string, unknown>])[0]
}

export async function createTournament(tournament: Partial<Tournament>): Promise<Tournament> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('tournament')
    .insert(tournament)
    .select()
    .single()
  
  if (error) throw error
  
  // Audit log
  await createAuditLog({
    tableName: 'tournament',
    recordId: data.id,
    action: 'create',
    newValues: tournament as Record<string, unknown>,
    description: `Crear torneo: ${data.name}`
  })
  
  return data
}

export async function deleteTournament(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('tournament')
    .delete()
    .eq('id', id)
  
  if (error) throw error
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
  const oldValues = await getDbRecordForAudit(supabase, 'tournament', id)
  const tournamentDB = normalizeTournamentToDB(data)
  const { data: updated, error } = await supabase
    .from('tournament')
    .update(tournamentDB)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error

  await createAuditLog({
    tableName: 'tournament',
    recordId: id,
    action: 'update',
    oldValues: oldValues || undefined,
    newValues: tournamentDB,
    description: `Actualizar torneo: ${updated.name}`,
  })

  return normalizeTournamentFromDB([updated as Record<string, unknown>])[0]
}

// Normalizar Tournament de App (camelCase) a DB (snake_case)
function normalizeTournamentToDB(tournament: Partial<Tournament>): Record<string, unknown> {
  const { name, year, description, status, regulationUrl, libreTeamEnabled, yellowCardSuspensionThreshold, consecutiveYellowSuspension, redCardSuspensionMatches, createdAt, updatedAt, ...rest } = tournament as Record<string, unknown>
  return {
    ...rest,
    name: name as string | undefined,
    year: year as number | undefined,
    description: description as string | null,
    status: status as string | undefined,
    regulation_url: regulationUrl as string | null,
    libre_team_enabled: libreTeamEnabled as boolean | undefined,
    yellow_card_suspension_threshold: yellowCardSuspensionThreshold as number | undefined,
    consecutive_yellow_suspension: consecutiveYellowSuspension as number | undefined,
    red_card_suspension_matches: redCardSuspensionMatches as number | undefined,
    created_at: createdAt as string | undefined,
    updated_at: updatedAt as string | undefined,
  }
}

// Normalizar Tournament de DB (snake_case) a App (camelCase)
function normalizeTournamentFromDB(data: Record<string, unknown>[]): Tournament[] {
  return (data || []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    year: row.year as number,
    description: row.description as string | null,
    status: row.status as TournamentStatus,
    regulationUrl: row.regulation_url as string | null,
    libreTeamEnabled: row.libre_team_enabled as boolean || false,
    yellowCardSuspensionThreshold: row.yellow_card_suspension_threshold as number || 4,
    consecutiveYellowSuspension: row.consecutive_yellow_suspension as number || 2,
    redCardSuspensionMatches: row.red_card_suspension_matches as number || 2,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }))
}

// Normalizar Team de App (camelCase) a DB (snake_case)
function normalizeTeamToDB(team: Partial<Team>): Record<string, unknown> {
  // Eliminar propiedades camelCase del spread para evitar conflictos
  const { tournamentId, shieldUrl, teamPhotoUrl, active, createdAt, updatedAt, ...rest } = team as Record<string, unknown>
  return {
    ...rest,
    tournament_id: tournamentId as string | undefined,
    shield_url: shieldUrl as string | undefined,
    team_photo_url: teamPhotoUrl as string | undefined,
    active: active as boolean | undefined,
    created_at: createdAt as string | undefined,
    updated_at: updatedAt as string | undefined,
  }
}

// Normalizar Team de DB (snake_case) a App (camelCase)
function normalizeTeamFromDB(data: Record<string, unknown>[]): Team[] {
  return (data || []).map((row) => ({
    id: row.id as string,
    tournamentId: row.tournament_id as string,
    name: row.name as string,
    description: row.description as string | null,
    shieldUrl: row.shield_url as string | null,
    teamPhotoUrl: row.team_photo_url as string | null,
    active: row.active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }))
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
  return normalizeTeamFromDB(data || [])
}

export async function getTeamById(id: string): Promise<Team | null> {
  // En modo demo
  if (env.demoMode) {
    return demoTeams.find(t => t.id === id) || null
  }
  
  const supabase = getSupabaseClient()
  console.log('getTeamById - buscando team:', id)
  const { data, error } = await supabase
    .from('team')
    .select('*')
    .eq('id', id)
    .single()
  
  console.log('getTeamById - resultado:', data, 'error:', error)
  if (error) {
    console.error('getTeamById ERROR:', error.message)
    return null
  }
  return data ? normalizeTeamFromDB([data])[0] : null
}

export async function createTeam(team: Partial<Team>): Promise<Team> {
  const supabase = getSupabaseClient()
  const teamDB = normalizeTeamToDB(team)
  const { data, error } = await supabase
    .from('team')
    .insert(teamDB)
    .select()
    .single()
  
  if (error) throw error

  await createAuditLog({
    tableName: 'team',
    recordId: data.id,
    action: 'create',
    newValues: teamDB,
    description: `Crear equipo: ${data.name}`,
  })

  return normalizeTeamFromDB([data as Record<string, unknown>])[0]
}

export async function updateTeam(id: string, team: Partial<Team>): Promise<Team> {
  const supabase = getSupabaseClient()
  const oldValues = await getDbRecordForAudit(supabase, 'team', id)
  const teamDB = normalizeTeamToDB(team)
  const { data, error } = await supabase
    .from('team')
    .update(teamDB)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error

  await createAuditLog({
    tableName: 'team',
    recordId: id,
    action: 'update',
    oldValues: oldValues || undefined,
    newValues: teamDB,
    description: `Actualizar equipo: ${data.name}`,
  })

  return normalizeTeamFromDB([data as Record<string, unknown>])[0]
}

export async function deleteTeam(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const oldValues = await getDbRecordForAudit(supabase, 'team', id)
  const { error } = await supabase
    .from('team')
    .delete()
    .eq('id', id)
  
  if (error) throw error

  await createAuditLog({
    tableName: 'team',
    recordId: id,
    action: 'delete',
    oldValues: oldValues || undefined,
    description: 'Eliminar equipo',
  })
}

export async function deletePlayer(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const oldValues = await getDbRecordForAudit(supabase, 'player', id)
  const { error } = await supabase
    .from('player')
    .delete()
    .eq('id', id)
  
  if (error) throw error

  await createAuditLog({
    tableName: 'player',
    recordId: id,
    action: 'delete',
    oldValues: oldValues || undefined,
    description: 'Eliminar jugador',
  })
}

export async function deleteMatchDay(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const oldValues = await getDbRecordForAudit(supabase, 'match_day', id)
  const { error } = await supabase
    .from('match_day')
    .delete()
    .eq('id', id)
  
  if (error) throw error

  await createAuditLog({
    tableName: 'match_day',
    recordId: id,
    action: 'delete',
    oldValues: oldValues || undefined,
    description: 'Eliminar fecha',
  })
}

export async function deleteMatch(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const oldValues = await getDbRecordForAudit(supabase, 'match', id)
  const { error } = await supabase
    .from('match')
    .delete()
    .eq('id', id)
  
  if (error) throw error

  await createAuditLog({
    tableName: 'match',
    recordId: id,
    action: 'delete',
    oldValues: oldValues || undefined,
    description: 'Eliminar partido',
  })
}

// Normalizar Player de App (camelCase) a DB (snake_case)
function normalizePlayerToDB(player: Partial<Player>): Record<string, unknown> {
  // Eliminar propiedades camelCase del spread para evitar conflictos
  const { teamId, firstName, lastName, photoUrl, shirtNumber, position, active, createdAt, updatedAt, ...rest } = player as Record<string, unknown>
  return {
    ...rest,
    team_id: teamId as string | undefined,
    first_name: firstName as string | undefined,
    last_name: lastName as string | undefined,
    photo_url: photoUrl as string | undefined,
    shirt_number: shirtNumber as number | undefined,
    position: position as string | undefined,
    active: active as boolean | undefined,
    created_at: createdAt as string | undefined,
    updated_at: updatedAt as string | undefined,
  }
}

// Normalizar Player de DB (snake_case) a App (camelCase)
function normalizePlayerFromDB(data: Record<string, unknown>[]): Player[] {
  return (data || []).map((row) => ({
    id: row.id as string,
    teamId: row.team_id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    photoUrl: row.photo_url as string | null,
    shirtNumber: row.shirt_number as number | null,
    position: row.position as string | null,
    active: row.active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }))
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
  console.log('getPlayers teamId:', teamId)
  const { data, error } = await supabase
    .from('player')
    .select('*')
    .eq('team_id', teamId)
    .order('shirt_number')
  
  console.log('getPlayers result:', data?.length, 'error:', error)
  if (error) throw error
  return normalizePlayerFromDB(data || [])
}

export async function createPlayer(player: Partial<Player>): Promise<Player> {
  const supabase = getSupabaseClient()
  const playerDB = normalizePlayerToDB(player)
  const { data, error } = await supabase
    .from('player')
    .insert(playerDB)
    .select()
    .single()
  
  if (error) throw error

  await createAuditLog({
    tableName: 'player',
    recordId: data.id,
    action: 'create',
    newValues: playerDB,
    description: 'Crear jugador',
  })

  return normalizePlayerFromDB([data as Record<string, unknown>])[0]
}

// Get all players for a tournament (for admin panel)
export async function getPlayersByTournament(tournamentId: string): Promise<Player[]> {
  if (env.demoMode) return []
  
  const supabase = getSupabaseClient()
  
  // Get teams for this tournament first
  const { data: teams } = await supabase
    .from('team')
    .select('id')
    .eq('tournament_id', tournamentId)
  
  if (!teams || teams.length === 0) return []
  
  const teamIds = teams.map(t => t.id)
  
  const { data, error } = await supabase
    .from('player')
    .select('*')
    .in('team_id', teamIds)
    .order('last_name')
  
  if (error) throw error
  return normalizePlayerFromDB(data || [])
}

export async function updatePlayer(id: string, player: Partial<Player>): Promise<Player> {
  const supabase = getSupabaseClient()
  const oldValues = await getDbRecordForAudit(supabase, 'player', id)
  const playerDB = normalizePlayerToDB(player)
  const { data, error } = await supabase
    .from('player')
    .update(playerDB)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error

  await createAuditLog({
    tableName: 'player',
    recordId: id,
    action: 'update',
    oldValues: oldValues || undefined,
    newValues: playerDB,
    description: 'Actualizar jugador',
  })

  return normalizePlayerFromDB([data as Record<string, unknown>])[0]
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
  return normalizeMatchDayFromDB(data || [])
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
    .eq('published', true)
    .order('number')
  
  if (error) throw error
  return normalizeMatchDayFromDB(data || [])
}

// Normalizar MatchDay de App (camelCase) a DB (snake_case)
function normalizeMatchDayToDB(matchDay: Partial<MatchDay>): Record<string, unknown> {
  const { tournamentId, referenceDate, freeTeamId, ...rest } = matchDay as Record<string, unknown>
  return {
    ...rest,
    tournament_id: tournamentId,
    reference_date: referenceDate,
    free_team_id: freeTeamId,
    created_at: undefined,
    updated_at: undefined,
  }
}

// Normalizar MatchDay de DB (snake_case) a App (camelCase)
function normalizeMatchDayFromDB(data: Record<string, unknown>[]): MatchDay[] {
  return (data || []).map((row) => ({
    id: row.id as string,
    tournamentId: row.tournament_id as string,
    number: row.number as number,
    title: row.title as string | null,
    published: row.published as boolean,
    referenceDate: row.reference_date as string | null,
    freeTeamId: row.free_team_id as string | null,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }))
}

export async function createMatchDay(matchDay: Partial<MatchDay>): Promise<MatchDay> {
  const supabase = getSupabaseClient()
  const matchDayDB = normalizeMatchDayToDB(matchDay)
  const { data, error } = await supabase
    .from('match_day')
    .insert(matchDayDB)
    .select()
    .single()
  
  if (error) throw error

  await createAuditLog({
    tableName: 'match_day',
    recordId: data.id,
    action: 'create',
    newValues: matchDayDB,
    description: `Crear fecha ${data.number}`,
  })

  return normalizeMatchDayFromDB([data as Record<string, unknown>])[0]
}

export async function updateMatchDay(id: string, matchDay: Partial<MatchDay>): Promise<MatchDay> {
  const supabase = getSupabaseClient()
  const oldValues = await getDbRecordForAudit(supabase, 'match_day', id)
  const matchDayDB = normalizeMatchDayToDB(matchDay)
  const { data, error } = await supabase
    .from('match_day')
    .update(matchDayDB)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error

  await createAuditLog({
    tableName: 'match_day',
    recordId: id,
    action: 'update',
    oldValues: oldValues || undefined,
    newValues: matchDayDB,
    description: `Actualizar fecha ${data.number}`,
  })

  return normalizeMatchDayFromDB([data as Record<string, unknown>])[0]
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
    .order('scheduled_at', { ascending: true })
  
  if (error) throw error
  return normalizeMatchFromDB(data || [])
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
  
  // Normalizar de snake_case a camelCase
  return {
    id: data.id,
    matchDayId: data.match_day_id,
    homeTeamId: data.home_team_id,
    awayTeamId: data.away_team_id,
    scheduledAt: data.scheduled_at,
    venue: data.venue,
    status: data.status,
    homeGoals: data.home_goals,
    awayGoals: data.away_goals,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function updateMatch(id: string, match: Partial<Match>): Promise<Match> {
  const supabase = getSupabaseClient()
  const oldValues = await getDbRecordForAudit(supabase, 'match', id)
  const matchDB = normalizeMatchToDB(match)
  
  // Obtener el partido actual para saber si está cambiando a "jugado"
  const { data: currentMatch } = await supabase
    .from('match')
    .select('status, home_team_id, away_team_id, match_day_id')
    .eq('id', id)
    .single()
  
  const { data, error } = await supabase
    .from('match')
    .update(matchDB)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error

  await createAuditLog({
    tableName: 'match',
    recordId: id,
    action: 'update',
    oldValues: oldValues || undefined,
    newValues: matchDB,
    description: 'Actualizar partido',
  })
  
  // Si el partido pasa a "jugado" y no lo estaba antes, actualizar sanciones
  if (match.status === 'jugado' && currentMatch && currentMatch.status !== 'jugado') {
    try {
      await updateSanctionsForPlayedMatch(supabase, id, currentMatch.home_team_id, currentMatch.away_team_id, currentMatch.match_day_id)
    } catch (err) {
      console.error('ERROR updating sanctions:', err)
    }
  }
  
  return normalizeMatchFromDB([data as Record<string, unknown>])[0]
}

// Actualizar sanciones cuando se juega un partido
async function updateSanctionsForPlayedMatch(supabase: any, matchId: string, homeTeamId: string, awayTeamId: string, matchDayId: string) {
  console.log('🔍 DEBUG updateSanctionsForPlayedMatch - matchId:', matchId, 'homeTeam:', homeTeamId, 'awayTeam:', awayTeamId)
  
  // Primero, verificar si algún equipo tuvo fecha libre en esta fecha
  const { data: matchDay } = await supabase
    .from('match_day')
    .select('free_team_id')
    .eq('id', matchDayId)
    .single()
  
  const freeTeamId = matchDay?.free_team_id
  
  // Determinar qué equipos realmente jugaron (no tiveram fecha libre)
  const teamsThatPlayed = []
  if (freeTeamId !== homeTeamId) teamsThatPlayed.push(homeTeamId)
  if (freeTeamId !== awayTeamId) teamsThatPlayed.push(awayTeamId)
  
  console.log('🔍 DEBUG - freeTeamId:', freeTeamId, 'teamsThatPlayed:', teamsThatPlayed)
  
  if (teamsThatPlayed.length === 0) {
    console.log('🔍 DEBUG - No team actually played (both had free date)')
    return
  }
  
  // Obtener sanciones vigentes SOLO de los equipos que realmente jugaron
  const { data: sanctions } = await supabase
    .from('sanction')
    .select('*')
    .in('team_id', teamsThatPlayed)
    .eq('status', 'vigente')
  
  console.log('🔍 DEBUG updateSanctionsForPlayedMatch - sanctions found:', sanctions?.length || 0)
  
  if (!sanctions || sanctions.length === 0) {
    console.log('🔍 DEBUG - No active sanctions for teams that played')
    return
  }

  // Para cada sanción, incrementar matchesServed
  for (const sanction of sanctions) {
    console.log('🔍 DEBUG - processing sanction:', sanction.id, 'player:', sanction.player_id, 'matches_served:', sanction.matches_served, 'total:', sanction.total_matches)
    
    const newMatchesServed = (sanction.matches_served || 0) + 1
    
    if (newMatchesServed >= sanction.total_matches) {
      // Sanción cumplida
      await supabase
        .from('sanction')
        .update({ 
          matches_served: newMatchesServed,
          status: 'cumplida'
        })
        .eq('id', sanction.id)
      console.log('🔍 DEBUG - Sanction COMPLETED:', sanction.id)
    } else {
      // Incrementar partidos cumplidos
      await supabase
        .from('sanction')
        .update({ matches_served: newMatchesServed })
        .eq('id', sanction.id)
      console.log('🔍 DEBUG - Sanction updated, now served:', newMatchesServed)
    }
  }
}

// Normalizar Match de App (camelCase) a DB (snake_case)
function normalizeMatchToDB(match: Partial<Match>): Record<string, unknown> {
  const { matchDayId, homeTeamId, awayTeamId, scheduledAt, venue, status, homeGoals, awayGoals, notes, ...rest } = match as Record<string, unknown>
  return {
    ...rest,
    match_day_id: matchDayId,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    scheduled_at: scheduledAt,
    venue: venue,
    status: status,
    home_goals: homeGoals,
    away_goals: awayGoals,
    notes: notes,
    created_at: undefined,
    updated_at: undefined,
  }
}

// Normalizar Match de DB (snake_case) a App (camelCase)
function normalizeMatchFromDB(data: Record<string, unknown>[]): Match[] {
  return (data || []).map((row) => ({
    id: row.id as string,
    matchDayId: row.match_day_id as string,
    homeTeamId: row.home_team_id as string,
    awayTeamId: row.away_team_id as string,
    scheduledAt: row.scheduled_at as string | null,
    venue: row.venue as string | null,
    status: row.status as MatchStatus,
    homeGoals: row.home_goals as number | null,
    awayGoals: row.away_goals as number | null,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }))
}

// Normalizar Goal de DB (snake_case) a App (camelCase)
function normalizeGoalFromDB(data: Record<string, unknown>[]): Goal[] {
  return (data || []).map((row) => ({
    id: row.id as string,
    matchId: row.match_id as string,
    playerId: row.player_id as string,
    teamId: row.team_id as string,
    quantity: row.quantity as number,
    createdAt: row.created_at as string,
  }))
}

// Normalizar Card de DB (snake_case) a App (camelCase)
function normalizeCardFromDB(data: Record<string, unknown>[]): Card[] {
  return (data || []).map((row) => ({
    id: row.id as string,
    matchId: row.match_id as string,
    playerId: row.player_id as string,
    teamId: row.team_id as string,
    type: row.type as CardType,
    minute: row.minute as number | null,
    createdAt: row.created_at as string,
  }))
}

export async function createMatch(match: Partial<Match>): Promise<Match> {
  const supabase = getSupabaseClient()
  const matchDB = normalizeMatchToDB(match)
  const { data, error } = await supabase
    .from('match')
    .insert(matchDB)
    .select()
    .single()
  
  if (error) throw error

  await createAuditLog({
    tableName: 'match',
    recordId: data.id,
    action: 'create',
    newValues: matchDB,
    description: 'Crear partido',
  })

  return normalizeMatchFromDB([data as Record<string, unknown>])[0]
}

// Crear fecha con 4 partidos automáticamente (con horarios 09:00, 09:45, 10:30, 11:15)
export async function createMatchDayWithMatches(
  matchDay: Partial<MatchDay>
): Promise<MatchDay> {
  const supabase = getSupabaseClient()
  
  // Primero crear la fecha
  const matchDayDB = normalizeMatchDayToDB(matchDay)
  const { data: newMatchDay, error: matchDayError } = await supabase
    .from('match_day')
    .insert(matchDayDB)
    .select()
    .single()
  
  if (matchDayError) throw matchDayError
  
  // Los horarios para los 4 partidos
const matchTimes = [
    '09:00:00',
    '09:45:00', 
    '10:30:00',
    '11:15:00'
  ]

  const refDate = matchDay.referenceDate as string | null | undefined
  
  // Crear los 4 partidos SIN equipos (NULL) - se asignan al editar
  const matches = matchTimes.map((time, idx) => ({
    match_day_id: newMatchDay.id,
    home_team_id: null,  // Sin equipo asignado
    away_team_id: null,  // Sin equipo asignado
    scheduled_at: refDate ? `${refDate}T${time}` : null,
    venue: null,
    status: 'programado',
    home_goals: null,
    away_goals: null,
    notes: idx === 0 ? 'Partido por configurar' : null,
  }))
  
  const { error: matchesError } = await supabase
    .from('match')
    .insert(matches)
  
  if (matchesError) {
    console.error('Error creating matches:', matchesError)
  }
  
return normalizeMatchDayFromDB([newMatchDay as Record<string, unknown>])[0]
}

export async function getGoalsByMatch(matchId: string): Promise<Goal[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('goal')
    .select('*')
    .eq('match_id', matchId)
  
  if (error) throw error
  return (data || []).map((g) => ({
    id: g.id,
    matchId: g.match_id,
    playerId: g.player_id,
    teamId: g.team_id,
    quantity: g.quantity,
    createdAt: g.created_at,
  }))
}

// Alias for backwards compatibility
export { getGoalsByMatch as getGoals }

export async function getGoalsByTeam(teamId: string): Promise<Goal[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('goal')
    .select('*')
    .eq('team_id', teamId)
  
  if (error) throw error
  
  return normalizeGoalFromDB(data || [])
}

export async function getCardsByTeam(teamId: string): Promise<Card[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('card')
    .select('*')
    .eq('team_id', teamId)
  
  if (error) throw error
  
  return normalizeCardFromDB(data || [])
}

export async function createGoal(goal: Partial<Goal>): Promise<Goal> {
  // Normalizar a snake_case
  const goalDB = {
    match_id: goal.matchId,
    team_id: goal.teamId,
    player_id: goal.playerId,
    quantity: goal.quantity ?? 1,
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('goal')
    .insert(goalDB)
    .select()
    .single()
  
  if (error) throw error

  await createAuditLog({
    tableName: 'goal',
    recordId: data.id,
    action: 'create',
    newValues: goalDB,
    description: 'Crear gol',
  })
  
  // Normalizar respuesta
  return {
    id: data.id,
    matchId: data.match_id,
    teamId: data.team_id,
    playerId: data.player_id,
    quantity: data.quantity,
    createdAt: data.created_at,
  }
}

export async function deleteGoal(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const oldValues = await getDbRecordForAudit(supabase, 'goal', id)
  const { error } = await supabase
    .from('goal')
    .delete()
    .eq('id', id)
  
  if (error) throw error

  await createAuditLog({
    tableName: 'goal',
    recordId: id,
    action: 'delete',
    oldValues: oldValues || undefined,
    description: 'Eliminar gol',
  })
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
    .select(`
      quantity,
      player:player_id(id, first_name, last_name, photo_url, shirt_number, team_id),
      team:team_id(id, name)
    `)
    .in('team_id', teamIds)
  
  if (error) throw error
  
  // Aggregate goals by player
  const goalsMap = new Map<string, { player: Player; team: Team; totalGoals: number }>()
  
  const typedData = data as unknown as Array<{
    quantity: number
    player: { id: string; first_name: string; last_name: string; photo_url: string | null; shirt_number: number | null; team_id: string }
    team: { id: string; name: string }
  }>
  
  typedData?.forEach((goal) => {
    if (!goal.player?.id) return
    
    const playerId = goal.player.id
    const existing = goalsMap.get(playerId)
    const qty = goal.quantity || 1
    
    // Normalizar player
    const normalizedPlayer: Player = {
      id: goal.player.id,
      firstName: goal.player.first_name,
      lastName: goal.player.last_name,
      photoUrl: goal.player.photo_url,
      shirtNumber: goal.player.shirt_number,
      position: null,
      teamId: goal.player.team_id,
      active: true,
      createdAt: '',
      updatedAt: '',
    }
    
    // Normalizar team
    const normalizedTeam: Team = {
      id: goal.team.id,
      name: goal.team.name,
      tournamentId: tournamentId,
      description: null,
      shieldUrl: null,
      teamPhotoUrl: null,
      active: true,
      createdAt: '',
      updatedAt: '',
    }
    
    if (existing) {
      existing.totalGoals += qty
    } else {
      goalsMap.set(playerId, {
        player: normalizedPlayer,
        team: normalizedTeam,
        totalGoals: qty,
      })
    }
  })
  
  return Array.from(goalsMap.values()).sort((a, b) => b.totalGoals - a.totalGoals)
}

// Get all played matches for results
export async function getPlayedMatches(tournamentId: string): Promise<Match[]> {
  console.log('DEBUG getPlayedMatches - tournamentId:', tournamentId)
  
  if (env.demoMode) {
    return getDemoPlayedMatches() as Match[]
  }
  const supabase = getSupabaseClient()
  
  // Get match days for this tournament
  const { data: matchDays } = await supabase
    .from('match_day')
    .select('id, number, title')
    .eq('tournament_id', tournamentId)
  
  console.log('DEBUG getPlayedMatches - matchDays:', matchDays)
  
  if (!matchDays || matchDays.length === 0) return []
  
  const matchDayMap = new Map(matchDays.map(md => [md.id, md]))
  
  // Fetch matches for each match day separately
  const allMatches: any[] = []
  
  for (const md of matchDays) {
    const { data: matches } = await supabase
      .from('match')
      .select('*')
      .eq('match_day_id', md.id)
      .eq('status', 'jugado')
    
    console.log('DEBUG getPlayedMatches - matches for md', md.id, ':', matches)
    if (matches) allMatches.push(...matches)
  }
  
  console.log('DEBUG getPlayedMatches - allMatches:', allMatches)
  
  // Normalizar datos e incluir info de la fecha
  return (allMatches || []).map((m) => {
    const md = matchDayMap.get(m.match_day_id)
    return {
      id: m.id,
      matchDayId: m.match_day_id,
      matchDayNumber: md?.number || md?.title || null,
      homeTeamId: m.home_team_id,
      awayTeamId: m.away_team_id,
      scheduledAt: m.scheduled_at,
      venue: m.venue,
      status: m.status,
      homeGoals: m.home_goals,
      awayGoals: m.away_goals,
      notes: m.notes,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }
  })
}

// Get next visible match day (not played yet) - la primera fecha no disputada
export async function getNextMatchDay(tournamentId: string): Promise<MatchDay | null> {
  if (env.demoMode) {
    return getDemoNextMatchDay() as MatchDay | null
  }
  const supabase = getSupabaseClient()
  
  // Get all published match days ordered by number
  const { data: matchDays, error } = await supabase
    .from('match_day')
    .select('id, number, title, reference_date, published')
    .eq('tournament_id', tournamentId)
    .eq('published', true)
    .order('number')
  
  if (error || !matchDays || matchDays.length === 0) return null
  
  // Find the first date that has at least one non-played match
  for (const md of matchDays) {
    const { data: matches } = await supabase
      .from('match')
      .select('status')
      .eq('match_day_id', md.id)
    
    if (matches && matches.some(m => m.status !== 'jugado')) {
      // This date has at least one match not played yet
      return normalizeMatchDayFromDB([md as Record<string, unknown>])[0]
    }
  }
  
  // All dates are fully played - return the last date as reference
  const lastDate = matchDays[matchDays.length - 1]
  return normalizeMatchDayFromDB([lastDate as Record<string, unknown>])[0]
}

// Get played matches from the most recent played date only
export async function getRecentPlayedMatches(tournamentId: string, limit: number = 5): Promise<Match[]> {
  if (env.demoMode) {
    return getDemoRecentPlayedMatches(limit) as Match[]
  }
  const supabase = getSupabaseClient()
  
  // Get all match days
  const { data: matchDays } = await supabase
    .from('match_day')
    .select('id, number')
    .eq('tournament_id', tournamentId)
    .order('number', { ascending: false })
  
  if (!matchDays || matchDays.length === 0) return []
  
  // Find the most recent date that has played matches
  for (const md of matchDays) {
    const { data: playedMatches } = await supabase
      .from('match')
      .select('*')
      .eq('match_day_id', md.id)
      .eq('status', 'jugado')
    
    if (playedMatches && playedMatches.length > 0) {
      // Found the most recent date with played matches - return only those
      return playedMatches.slice(0, limit).map((m) => ({
        id: m.id,
        matchDayId: m.match_day_id,
        matchDayNumber: md.number,
        homeTeamId: m.home_team_id,
        awayTeamId: m.away_team_id,
        scheduledAt: m.scheduled_at,
        venue: m.venue,
        status: m.status,
        homeGoals: m.home_goals,
        awayGoals: m.away_goals,
        notes: m.notes,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      }))
    }
  }
  
  return []
}

// Get active sanctions for public display
export async function getPublicSanctions(tournamentId: string): Promise<Array<{
  id: string
  playerId: string
  playerName: string
  teamId: string
  teamName: string
  reason: string
  totalMatches: number
  matchesServed: number
  status: string
  origin: string
  originMatchDay: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}>> {
  if (env.demoMode) {
    const demo = getDemoPublicSanctions()
    return demo.map((s: any) => ({
      ...s,
      playerName: 'Jugador Demo',
      teamName: 'Equipo Demo',
      originMatchDay: null,
    }))
  }
  const supabase = getSupabaseClient()
  
  const { data: teams } = await supabase
    .from('team')
    .select('id, name')
    .eq('tournament_id', tournamentId)
    .eq('active', true)
  
  if (!teams || teams.length === 0) return []
  
  const teamIds = teams.map(t => t.id)
  const teamMap = new Map(teams.map(t => [t.id, t.name]))
  
  // Get all match days for reference
  const { data: matchDays } = await supabase
    .from('match_day')
    .select('id, number')
    .eq('tournament_id', tournamentId)
  
  const matchDayMap = new Map(matchDays?.map(md => [md.id, md.number]) || [])
  
  // Get all players for the teams
  const { data: players } = await supabase
    .from('player')
    .select('id, first_name, last_name')
    .in('team_id', teamIds)
    .eq('active', true)
  
  const playerMap = new Map(players?.map(p => [p.id, `${p.first_name} ${p.last_name}`]) || [])
  
  const { data: sanctions } = await supabase
    .from('sanction')
    .select('id, player_id, team_id, reason, total_matches, matches_served, status, origin, notes, created_at, updated_at')
    .in('team_id', teamIds)
    .eq('status', 'vigente')
    .order('created_at', { ascending: false })
  
  if (!sanctions || sanctions.length === 0) return []
  
  // Obtener información de tarjetas para determinar la fecha de origen
  const allCardsData = await supabase
    .from('card')
    .select('id, player_id, match_id, team_id')
    .in('team_id', teamIds)
  
  const cardsList = allCardsData.data || []
  const cardMatchMap = new Map<string, string>()
  for (const c of cardsList) {
    cardMatchMap.set(c.id, c.match_id)
  }
  
  const matchIdsSet = new Set<string>()
  for (const c of cardsList) {
    if (c.match_id) matchIdsSet.add(c.match_id)
  }
  
  const matchMatchDayMap = new Map<string, string>()
  if (matchIdsSet.size > 0) {
    const { data: matches } = await supabase
      .from('match')
      .select('id, match_day_id')
      .in('id', Array.from(matchIdsSet))
    
    if (matches) {
      for (const m of matches) {
        matchMatchDayMap.set(m.id, m.match_day_id)
      }
    }
  }
  
  return sanctions.map((row) => {
    let originMatchDay: string | null = null
    
    if (row.origin === 'roja' || row.origin === 'amarillas_consecutivas' || row.origin === 'acumulacion_amarillas') {
      const playerCards = cardsList.filter(c => c.player_id === row.player_id)
      if (playerCards.length > 0) {
        const lastCard = playerCards[0]
        const matchId = cardMatchMap.get(lastCard.id)
        if (matchId) {
          const matchDayId = matchMatchDayMap.get(matchId)
          if (matchDayId) {
            const mdNumber = matchDayMap.get(matchDayId)
            if (mdNumber) originMatchDay = `Fecha ${mdNumber}`
          }
        }
      }
    } else {
      originMatchDay = 'Sanción de oficio'
    }
    
    const originLabel = row.origin === 'roja' ? 'Tarjeta Roja' :
      row.origin === 'acumulacion_amarillas' ? 'Acumulación' :
      row.origin === 'amarillas_consecutivas' ? 'Consecutivas' : 'Manual'
    
    return {
      id: row.id,
      playerId: row.player_id,
      playerName: playerMap.get(row.player_id) || 'Jugador',
      teamId: row.team_id,
      teamName: teamMap.get(row.team_id) || 'Equipo',
      reason: row.reason,
      totalMatches: row.total_matches,
      matchesServed: row.matches_served,
      status: row.status,
      origin: row.origin,
      originMatchDay: originMatchDay ? `${originLabel} en ${originMatchDay}` : originMatchDay,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  })
}

// Función de debug para ver el estado real de las sanciones en la base de datos
export async function debugSanctions(tournamentId: string): Promise<void> {
  console.log('🔧 DEBUG: debugSanctions called')
  
  const supabase = getSupabaseClient()
  
  // Obtener todos los equipos
  const { data: teams } = await supabase
    .from('team')
    .select('id, name')
    .eq('tournament_id', tournamentId)
    .eq('active', true)
  
  console.log('🔧 DEBUG: Teams:', teams?.map(t => t.name))
  
  const teamIds = teams?.map(t => t.id) || []
  
  // Obtener TODAS las sanciones (vigentes y cumplidas)
  const { data: allSanctions } = await supabase
    .from('sanction')
    .select('id, player_id, team_id, reason, total_matches, matches_served, status, origin, created_at')
    .in('team_id', teamIds)
    .order('created_at', { ascending: false })
  
  console.log('🔧 DEBUG: ALL sanctions (vigente + cumplida):', allSanctions)
  
  // Obtener solo vigentes
  const { data: vigentes } = await supabase
    .from('sanction')
    .select('id, player_id, team_id, reason, total_matches, matches_served, status, origin, created_at')
    .in('team_id', teamIds)
    .eq('status', 'vigente')
  
  console.log('🔧 DEBUG: Only vigente:', vigentes)
  
  return
}

// Función para corregir las sanciones específicas del problema
// Resetea los valores incorrectos basado en la lógica:
// - La sanción empieza a contar DESDE LA FECHA SIGUIENTE a cuando se creó la sanción
// - Si el equipo tuvo fecha libre, no cuenta esa fecha
// - Solo cuenta partidos jugados (ignora fechas libres)
export async function fixSanctionsManual(tournamentId: string): Promise<{ fixed: number; details: any[] }> {
  console.log('🔧 FIX: Starting manual fix for sanctions')
  
  const supabase = getSupabaseClient()
  
  // 1. Obtener equipos
  const { data: teams } = await supabase
    .from('team')
    .select('id, name')
    .eq('tournament_id', tournamentId)
    .eq('active', true)
  
  if (!teams || teams.length === 0) {
    return { fixed: 0, details: [] }
  }
  
  const teamMap = new Map(teams?.map(t => [t.id, t.name]) || [])
  const teamIds = teams?.map(t => t.id) || []
  
  // 2. Obtener todas las sanciones vigentes y cumplidas
  const { data: allSanctions } = await supabase
    .from('sanction')
    .select('*')
    .in('team_id', teamIds)
    .in('status', ['vigente', 'cumplida'])
  
  console.log('🔧 FIX: Found sanctions:', allSanctions?.length)
  
  // 3. Obtener match days
  const { data: matchDays } = await supabase
    .from('match_day')
    .select('id, number, free_team_id, scheduled_at')
    .eq('tournament_id', tournamentId)
    .order('number', { ascending: true })
  
  console.log('🔧 FIX: Match days:', matchDays?.map(md => ({ number: md.number, scheduled: md.scheduled_at, freeTeam: md.free_team_id })))
  
  // 4. Obtener todos los partidos jugados
  const { data: playedMatches } = await supabase
    .from('match')
    .select('id, match_day_id, home_team_id, away_team_id, status')
    .in('match_day_id', matchDays?.map(md => md.id) || [])
    .eq('status', 'jugado')
  
  // 5. Obtener las tarjetas para vincular sanciones con su fecha de origen
  const { data: allCards } = await supabase
    .from('card')
    .select('id, player_id, match_id, team_id, type')
    .in('team_id', teamIds)
  
  // Map match_id -> match_day_id
  const matchToMatchDayMap = new Map<string, string>()
  for (const match of playedMatches || []) {
    matchToMatchDayMap.set(match.id, match.match_day_id)
  }
  
  // Map tarjeta -> match_day_number
  const cardToMatchDayNumberMap = new Map<string, number>()
  for (const card of allCards || []) {
    if (card.match_id && matchToMatchDayMap.has(card.match_id)) {
      const matchDayId = matchToMatchDayMap.get(card.match_id)
      const matchDay = matchDays?.find(md => md.id === matchDayId)
      if (matchDay) {
        cardToMatchDayNumberMap.set(card.id, matchDay.number)
      }
    }
  }
  
  // Para sanciones automáticas, buscar la última tarjeta del mismo tipo
  const playerLastCardMap = new Map<string, { type: string; matchDayNumber: number }>()
  for (const card of allCards || []) {
    const existing = playerLastCardMap.get(card.player_id)
    const cardMatchDayNumber = cardToMatchDayNumberMap.get(card.id)
    
    if (!existing || (cardMatchDayNumber && cardMatchDayNumber > existing.matchDayNumber)) {
      playerLastCardMap.set(card.player_id, { type: card.type, matchDayNumber: cardMatchDayNumber || 0 })
    }
  }
  
  const details: any[] = []
  let fixed = 0
  
  // 6. Para cada sanción, recalcular correctamente
  for (const sanction of allSanctions || []) {
    const teamId = sanction.team_id
    const teamName = teamMap.get(teamId) || 'Unknown'
    
    console.log(`🔧 FIX: Processing ${teamName}, current: ${sanction.matches_served}/${sanction.total_matches}, origin: ${sanction.origin}, created: ${sanction.created_at}`)
    
    // Determinar desde qué número de fecha empezar a contar
    let startFromMatchDayNumber: number
    
    // Primero, buscar la fecha de la tarjeta que originó la sanción (si es automática)
    let cardMatchDayNumber: number | null = null
    
    if (sanction.origin === 'roja' || sanction.origin === 'amarillas_consecutivas' || sanction.origin === 'acumulacion_amarillas') {
      const lastCard = playerLastCardMap.get(sanction.player_id)
      if (lastCard) {
        cardMatchDayNumber = lastCard.matchDayNumber
      }
    }
    
    // Si tenemos la fecha de la tarjeta, usar esa; si no, usar la fecha de creación de la sanción
    const sanctionDate = cardMatchDayNumber || 0
    
    // La sanción empieza a contar DESDE LA FECHA SIGUIENTE
    startFromMatchDayNumber = sanctionDate + 1
    
    console.log(`🔧 FIX:   Sanction was in Fecha ${sanctionDate || 'unknown'}, start counting from Fecha ${startFromMatchDayNumber}`)
    
    // Contar partidos jugados desde startFromMatchDayNumber
    let actualMatchesPlayed = 0
    
    for (const match of playedMatches || []) {
      const matchDay = matchDays?.find(md => md.id === match.match_day_id)
      if (!matchDay) continue
      
      // Solo contar desde la fecha de inicio
      if (matchDay.number < startFromMatchDayNumber) {
        console.log(`🔧 FIX:   - Match ${match.id} (Fecha ${matchDay.number}): skipped (before sanction start)`)
        continue
      }
      
      const isHomeTeam = match.home_team_id === teamId
      const isAwayTeam = match.away_team_id === teamId
      
      if (isHomeTeam || isAwayTeam) {
        // Verificar que NO tuvo fecha libre
        if (matchDay.free_team_id !== teamId) {
          actualMatchesPlayed++
          console.log(`🔧 FIX:   - Match ${match.id} (Fecha ${matchDay.number}): COUNTED ✅`)
        } else {
          console.log(`🔧 FIX:   - Match ${match.id} (Fecha ${matchDay.number}): skipped (FREE DATE)`)
        }
      }
    }
    
    console.log(`🔧 FIX:   -> actualMatchesPlayed: ${actualMatchesPlayed}`)
    
    // El matches_served correcto
    const correctMatchesServed = Math.min(actualMatchesPlayed, sanction.total_matches)
    const correctStatus = correctMatchesServed >= sanction.total_matches ? 'cumplida' : 'vigente'
    
    const currentMatchesServed = sanction.matches_served || 0
    const currentStatus = sanction.status
    
    if (currentMatchesServed !== correctMatchesServed || currentStatus !== correctStatus) {
      console.log(`🔧 FIX:   -> FIXING: ${currentMatchesServed}/${sanction.total_matches} (${currentStatus}) -> ${correctMatchesServed}/${sanction.total_matches} (${correctStatus})`)
      
      await supabase
        .from('sanction')
        .update({
          matches_served: correctMatchesServed,
          status: correctStatus
        })
        .eq('id', sanction.id)
      
      details.push({
        team: teamName,
        playerId: sanction.player_id,
        from: `${currentMatchesServed}/${sanction.total_matches} (${currentStatus})`,
        to: `${correctMatchesServed}/${sanction.total_matches} (${correctStatus})`
      })
      
      fixed++
    } else {
      console.log(`🔧 FIX:   -> No change needed`)
    }
}
    
    console.log('🔧 FIX: Complete. Fixed', fixed, 'sanctions')
    return { fixed, details }
  }
  
  // Nueva versión de fixSanctionsManual - versión corregida
export async function fixSanctionsManualV2(tournamentId: string): Promise<{ fixed: number; details: any[] }> {
  const supabase = getSupabaseClient()
  
  const { data: teams } = await supabase.from('team').select('id, name').eq('tournament_id', tournamentId).eq('active', true)
  if (!teams) return { fixed: 0, details: [] }
  
  const teamMap = new Map(teams.map(t => [t.id, t.name]))
  const teamIds = teams.map(t => t.id)
  
  const { data: allSanctions } = await supabase.from('sanction').select('*').in('team_id', teamIds).in('status', ['vigente', 'cumplida'])
  
  const { data: matchDays } = await supabase.from('match_day').select('id, number, free_team_id').eq('tournament_id', tournamentId).order('number', { ascending: true })
  
  const { data: playedMatches } = await supabase.from('match').select('id, match_day_id, home_team_id, away_team_id').in('match_day_id', matchDays?.map(md => md.id) || []).eq('status', 'jugado')
  
  const { data: allCards } = await supabase.from('card').select('id, player_id, match_id, team_id').in('team_id', teamIds)
  
  const matchToMatchDayMap = new Map<string, string>()
  for (const match of playedMatches || []) matchToMatchDayMap.set(match.id, match.match_day_id)
  
  const cardToMatchDayNumberMap = new Map<string, number>()
  for (const card of allCards || []) {
    if (card.match_id && matchToMatchDayMap.has(card.match_id)) {
      const matchDay = matchDays?.find(md => md.id === matchToMatchDayMap.get(card.match_id))
      if (matchDay) cardToMatchDayNumberMap.set(card.id, matchDay.number)
    }
  }
  
  const playerLastCardMap = new Map<string, number>()
  for (const card of allCards || []) {
    const existing = playerLastCardMap.get(card.player_id)
    const cardMatchDayNumber = cardToMatchDayNumberMap.get(card.id)
    if (!existing || (cardMatchDayNumber && cardMatchDayNumber > existing)) {
      playerLastCardMap.set(card.player_id, cardMatchDayNumber || 0)
    }
  }
  
  const details: any[] = []
  let fixed = 0
  
  for (const sanction of allSanctions || []) {
    const teamName = teamMap.get(sanction.team_id) || 'Unknown'
    let startFromMatchDayNumber: number
    
    // Para TODO tipo de sanción (manual Y automática), empezar desde la fecha SIGUIENTE
    // Si es roja: empezar desde fecha siguiente a la tarjeta
    // Si es manual: empezar desde fecha siguiente a la creación de la sanción
    if (sanction.origin === 'roja' || sanction.origin === 'amarillas_consecutivas' || sanction.origin === 'acumulacion_amarillas') {
      const lastCardNumber = playerLastCardMap.get(sanction.player_id) || 1
      startFromMatchDayNumber = lastCardNumber + 1
    } else {
      // Para sanciones manuales: empezar desde fecha 2 (la fecha siguiente a fecha 1)
      startFromMatchDayNumber = 2
    }
    
    let actualMatchesPlayed = 0
    for (const match of playedMatches || []) {
      const matchDay = matchDays?.find(md => md.id === match.match_day_id)
      if (!matchDay || matchDay.number < startFromMatchDayNumber) continue
      
      const isTeam = match.home_team_id === sanction.team_id || match.away_team_id === sanction.team_id
      if (isTeam && matchDay.free_team_id !== sanction.team_id) actualMatchesPlayed++
    }
    
    const correctMatchesServed = Math.min(actualMatchesPlayed, sanction.total_matches)
    const correctStatus = correctMatchesServed >= sanction.total_matches ? 'cumplida' : 'vigente'
    
    if (sanction.matches_served !== correctMatchesServed || sanction.status !== correctStatus) {
      await supabase.from('sanction').update({ matches_served: correctMatchesServed, status: correctStatus }).eq('id', sanction.id)
      details.push({ team: teamName, from: `${sanction.matches_served}/${sanction.total_matches}`, to: `${correctMatchesServed}/${sanction.total_matches}` })
      fixed++
    }
  }
  
  return { fixed, details }
}

// Función para recalcular todas las sanciones desde cero
// Puedes llamarla desde la consola del navegador para debug o desde una página de admin
export async function recalculateAllSanctions(tournamentId: string): Promise<{ processed: number; updated: number }> {
  console.log('🔧 DEBUG: Starting recalculateAllSanctions for tournament:', tournamentId)
  
  const supabase = getSupabaseClient()
  
  // 1. Obtener todos los equipos del torneo
  const { data: teams } = await supabase
    .from('team')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('active', true)
  
  if (!teams || teams.length === 0) {
    console.log('🔧 DEBUG: No teams found')
    return { processed: 0, updated: 0 }
  }
  
  const teamIds = teams.map(t => t.id)
  
  // 2. Obtener todas las sanciones vigentes
  const { data: allSanctions } = await supabase
    .from('sanction')
    .select('*')
    .in('team_id', teamIds)
    .in('status', ['vigente', 'cumplida'])
  
  if (!allSanctions || allSanctions.length === 0) {
    console.log('🔧 DEBUG: No sanctions found')
    return { processed: 0, updated: 0 }
  }
  
  console.log('🔧 DEBUG: Found sanctions:', allSanctions.length)
  
  // 3. Obtener todos los partidos jugados con su match_day_id
  const { data: matchDays } = await supabase
    .from('match_day')
    .select('id, number, free_team_id')
    .eq('tournament_id', tournamentId)
  
  const matchDayMap = new Map(matchDays?.map(md => [md.id, md]) || [])
  
  // Obtener todos los partidos jugados
  const { data: playedMatches } = await supabase
    .from('match')
    .select('id, match_day_id, home_team_id, away_team_id, status')
    .in('match_day_id', matchDays?.map(md => md.id) || [])
    .eq('status', 'jugado')
  
  console.log('🔧 DEBUG: Found played matches:', playedMatches?.length || 0)
  
  // 4. Para cada sanción, calcular cuántos partidos真正的 jugaron (sin fecha libre)
  let updated = 0
  
  for (const sanction of allSanctions) {
    const teamId = sanction.team_id
    let matchesPlayed = 0
    
    // Contar partidos jugados por este equipo (sin fecha libre)
    for (const match of playedMatches || []) {
      const matchDay = matchDayMap.get(match.match_day_id)
      if (!matchDay) continue
      
      const isHomeTeam = match.home_team_id === teamId
      const isAwayTeam = match.away_team_id === teamId
      
      if (isHomeTeam || isAwayTeam) {
        // Verificar que NO tuvo fecha libre en esta fecha
        if (matchDay.free_team_id !== teamId) {
          matchesPlayed++
        }
      }
    }
    
    console.log(`🔧 DEBUG: Sanction ${sanction.id} (team ${teamId}): matchesPlayed = ${matchesPlayed}, current = ${sanction.matches_served}`)
    
    // Actualizar matches_served al número real de partidos jugados
    // (siempre y cuando no sea menor que el actual, para no decrementar)
    const newMatchesServed = Math.max(sanction.matches_served || 0, matchesPlayed)
    
    if (newMatchesServed !== sanction.matches_served) {
      const newStatus = newMatchesServed >= sanction.total_matches ? 'cumplida' : 'vigente'
      
      await supabase
        .from('sanction')
        .update({ 
          matches_served: newMatchesServed,
          status: newStatus
        })
        .eq('id', sanction.id)
      
      console.log(`🔧 DEBUG: Updated sanction ${sanction.id}: ${sanction.matches_served} -> ${newMatchesServed}, status -> ${newStatus}`)
      updated++
    }
  }
  
  console.log(`🔧 DEBUG: Recalculate complete. Processed ${allSanctions.length}, updated ${updated}`)
  return { processed: allSanctions.length, updated }
}

// Get all played matches with team info for standings calculation
export async function getAllPlayedMatchesWithTeams(tournamentId: string): Promise<Match[]> {
  console.log('DEBUG getAllPlayedMatchesWithTeams - tournamentId:', tournamentId)
  
  // En modo demo, retornar partidos jugados de demo
  if (env.demoMode) {
    console.log('DEBUG - demo mode')
    return getDemoAllPlayedMatchesWithTeams() as Match[]
  }
  
  const supabase = getSupabaseClient()
  
  // Get match day IDs for this tournament first
  const { data: matchDays } = await supabase
    .from('match_day')
    .select('id')
    .eq('tournament_id', tournamentId)
  
  if (!matchDays || matchDays.length === 0) return []
  
  // Fetch matches for each match day separately to avoid URL length issues
  const allMatches: any[] = []
  
  for (const md of matchDays) {
    const { data: matches } = await supabase
      .from('match')
      .select('id, match_day_id, home_team_id, away_team_id, status, home_goals, away_goals, scheduled_at, venue, notes, created_at, updated_at')
      .eq('match_day_id', md.id)
      .eq('status', 'jugado')
    
    if (matches) allMatches.push(...matches)
  }
  
  console.log('DEBUG - matches:', allMatches)
  
  if (allMatches.length === 0) return []
  
  // Get team names separately
  const teamIds = [...new Set(allMatches.map(m => m.home_team_id).concat(allMatches.map(m => m.away_team_id)))]
  const { data: teams } = await supabase
    .from('team')
    .select('id, name')
    .in('id', teamIds)
  
  const teamMap = new Map((teams || []).map(t => [t.id, t.name]))
  
  // Normalizar datos
  return allMatches.map((m) => ({
    id: m.id,
    matchDayId: m.match_day_id,
    homeTeamId: m.home_team_id,
    awayTeamId: m.away_team_id,
    homeTeamName: teamMap.get(m.home_team_id),
    awayTeamName: teamMap.get(m.away_team_id),
    scheduledAt: m.scheduled_at,
    venue: m.venue,
    status: m.status,
    homeGoals: m.home_goals,
    awayGoals: m.away_goals,
    notes: m.notes,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  }))
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
  
  return normalizeMatchFromDB(data || [])
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
  return (data || []).map((c) => ({
    id: c.id,
    matchId: c.match_id,
    playerId: c.player_id,
    teamId: c.team_id,
    type: c.type,
    minute: c.minute ?? null,
    createdAt: c.created_at,
  }))
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
  
  // Normalizar a snake_case
  const cardDB = {
    match_id: card.matchId,
    player_id: card.playerId,
    team_id: card.teamId,
    type: card.type,
    minute: card.minute,
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('card')
    .insert(cardDB)
    .select()
    .single()
  
  if (error) throw error

  await createAuditLog({
    tableName: 'card',
    recordId: data.id,
    action: 'create',
    newValues: cardDB,
    description: `Crear tarjeta ${data.type}`,
  })
  
  // After creating the card, check if player should be automatically suspended
  if (data) {
    await checkAndCreateAutomaticSanction(data.player_id, data.type, data.match_id)
  }
  
  // Normalizar respuesta
  return {
    id: data.id,
    matchId: data.match_id,
    playerId: data.player_id,
    teamId: data.team_id,
    type: data.type,
    minute: data.minute,
    createdAt: data.created_at,
  }
}

export async function deleteCard(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const oldValues = await getDbRecordForAudit(supabase, 'card', id)
  const { error } = await supabase
    .from('card')
    .delete()
    .eq('id', id)
  
  if (error) throw error

  await createAuditLog({
    tableName: 'card',
    recordId: id,
    action: 'delete',
    oldValues: oldValues || undefined,
    description: 'Eliminar tarjeta',
  })
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

// Get all cards (yellow and red) with player and team info
export async function getAllCards(tournamentId: string): Promise<Array<{
  playerId: string
  playerName: string
  teamId: string
  teamName: string
  yellowCount: number
  redCount: number
  details: Array<{ type: 'amarilla' | 'roja'; matchDayNumber: number }>
}>> {
  if (env.demoMode) return []
  
  const supabase = getSupabaseClient()
  
  // Get teams for this tournament
  const { data: teams, error: teamsError } = await supabase
    .from('team')
    .select('id, name')
    .eq('tournament_id', tournamentId)
    .eq('active', true)
  
  if (teamsError || !teams || teams.length === 0) return []
  
  const teamIds = teams.map(t => t.id)
  const teamIdToName = new Map(teams.map(t => [t.id, t.name]))
  
  // Get match days for the tournament
  const { data: matchDays } = await supabase
    .from('match_day')
    .select('id, number')
    .eq('tournament_id', tournamentId)
    .order('number', { ascending: true })
  
  const matchDayIdToNumber = new Map((matchDays || []).map(md => [md.id, md.number]))
  
  // Get players for these teams
  const { data: players } = await supabase
    .from('player')
    .select('id, first_name, last_name, team_id')
    .in('team_id', teamIds)
    .eq('active', true)
  
  if (!players || players.length === 0) return []
  
  const playerIdToName = new Map(players.map(p => [
    p.id,
    `${p.first_name} ${p.last_name}`
  ]))
  const playerIdToTeamId = new Map(players.map(p => [p.id, p.team_id]))
  
  // Get all cards for these teams
  const { data: cards } = await supabase
    .from('card')
    .select('player_id, team_id, type, match_id')
    .in('team_id', teamIds)
  
  if (!cards || cards.length === 0) return []
  
  // Get match_day for each card's match
  const matchIds = [...new Set(cards.map(c => c.match_id))]
  const { data: matches } = await supabase
    .from('match')
    .select('id, match_day_id')
    .in('id', matchIds)
  
  const matchIdToMatchDayId = new Map((matches || []).map(m => [m.id, m.match_day_id]))
  
  // Group cards by player
  const playerCards = new Map<string, Array<{ type: 'amarilla' | 'roja'; matchDayNumber: number }>>()
  
  for (const card of cards) {
    const playerId = card.player_id
    const matchId = card.match_id
    const matchDayId = matchIdToMatchDayId.get(matchId)
    const matchDayNumber = matchDayId ? matchDayIdToNumber.get(matchDayId) || 0 : 0
    
    if (!playerCards.has(playerId)) {
      playerCards.set(playerId, [])
    }
    playerCards.get(playerId)!.push({
      type: card.type as 'amarilla' | 'roja',
      matchDayNumber
    })
  }
  
  // Build result
  const result = Array.from(playerCards.entries()).map(([playerId, cardDetails]) => {
    const yellowCount = cardDetails.filter(c => c.type === 'amarilla').length
    const redCount = cardDetails.filter(c => c.type === 'roja').length
    
    return {
      playerId,
      playerName: playerIdToName.get(playerId) || 'Unknown',
      teamId: playerIdToTeamId.get(playerId) || '',
      teamName: teamIdToName.get(playerIdToTeamId.get(playerId) || '') || 'Unknown',
      yellowCount,
      redCount,
      details: cardDetails.sort((a, b) => a.matchDayNumber - b.matchDayNumber)
    }
  })
  
  // Sort by total cards descending (más tarjetas primero)
  return result.sort((a, b) => (b.yellowCount + b.redCount) - (a.yellowCount + a.redCount))
}

// Get yellow cards from the LAST played match day where each player's team participated
export async function getYellowCardsInLastMatchDay(tournamentId: string): Promise<Array<{ playerId: string; count: number; matchId: string; matchDayNumber: number }>> {
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
    
    return lastMatchDayCards.map(c => ({ playerId: c.playerId, count: 1, matchId: c.matchId, matchDayNumber: lastPlayedMatchDay.number as number }))
  }
  
  const supabase = getSupabaseClient()
  
  // Get all teams and match days
  const { data: teams } = await supabase
    .from('team')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('active', true)
  
  if (!teams || teams.length === 0) return []
  
  const { data: matchDays } = await supabase
    .from('match_day')
    .select('id, number, free_team_id')
    .eq('tournament_id', tournamentId)
    .order('number', { ascending: true }) // Ascending: desde la primera fecha
  
  if (!matchDays || matchDays.length === 0) return []
  
  // Para cada equipo, encontrar la última fecha donde participó (no quedó libre)
  // Iterar desde la primera fecha hacia adelante sobrescribe con la más reciente
  const teamLastPlayedDate = new Map<string, { matchDayId: string; matchIds: string[] }>()
  
  for (const md of matchDays) {
    const { data: matches } = await supabase
      .from('match')
      .select('id, home_team_id, away_team_id')
      .eq('match_day_id', md.id)
.eq('status', 'jugado')
     
    if (!matches) continue
    
    for (const team of teams) {
      // Verificar si el equipo participó (no quedó libre)
      const participated = matches.some(m => 
        m.home_team_id === team.id || m.away_team_id === team.id
      )
      
      // Sobrescribir siempre - nos quedamos con la última fecha más reciente
      if (participated && md.free_team_id !== team.id) {
        const matchIds = matches
          .filter(m => m.home_team_id === team.id || m.away_team_id === team.id)
          .map(m => m.id)
        teamLastPlayedDate.set(team.id, { matchDayId: md.id, matchIds })
      }
    }
  }
  
// Recolectar todas las tarjetas de las últimas fechas jugadas de cada equipo
  const allCards: Array<{ playerId: string; count: number; matchId: string; matchDayNumber: number }> = []
  
  // Map match_day_id to number for easy lookup
  const matchDayIdToNumber = new Map(matchDays.map(md => [md.id, md.number]))
  
  for (const [, data] of teamLastPlayedDate) {
    const matchDayNumber = matchDayIdToNumber.get(data.matchDayId) || 0
    const { data: cards } = await supabase
      .from('card')
      .select('player_id, match_id, team_id')
      .in('match_id', data.matchIds)
      .eq('type', 'amarilla')
    
    if (cards) {
      allCards.push(...cards.map(c => ({ 
        playerId: c.player_id, 
        count: 1, 
        matchId: c.match_id,
        matchDayNumber 
      })))
    }
  }
  
  return allCards
}
export async function getActiveSanctions(): Promise<Sanction[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sanction')
    .select('*')
    .in('status', ['vigente', 'cumplida'])
  
  if (error) throw error

  // Normalizar de snake_case a camelCase
  return (data || []).map((row) => ({
    id: row.id,
    playerId: row.player_id,
    teamId: row.team_id,
    reason: row.reason,
    totalMatches: row.total_matches,
    matchesServed: row.matches_served,
    status: row.status,
    origin: row.origin,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function getSanctionsByPlayer(playerId: string): Promise<Sanction[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sanction')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  // Normalizar de snake_case a camelCase
  return (data || []).map((row) => ({
    id: row.id,
    playerId: row.player_id,
    teamId: row.team_id,
    reason: row.reason,
    totalMatches: row.total_matches,
    matchesServed: row.matches_served,
    status: row.status,
    origin: row.origin,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
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
  
  // Normalizar a snake_case para Supabase
  const sanctionDB = {
    player_id: sanction.playerId,
    team_id: sanction.teamId,
    reason: sanction.reason,
    total_matches: sanction.totalMatches,
    matches_served: sanction.matchesServed ?? 0,
    status: sanction.status ?? 'vigente',
    origin: sanction.origin ?? 'manual',
    notes: sanction.notes,
  }
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sanction')
    .insert(sanctionDB)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating sanction:', error)
    throw error
  }

  await createAuditLog({
    tableName: 'sanction',
    recordId: data.id,
    action: 'create',
    newValues: sanctionDB,
    description: 'Crear sanción',
  })
  
  // Normalizar respuesta de snake_case a camelCase
  return {
    id: data.id,
    playerId: data.player_id,
    teamId: data.team_id,
    reason: data.reason,
    totalMatches: data.total_matches,
    matchesServed: data.matches_served,
    status: data.status,
    origin: data.origin,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
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
  const oldValues = await getDbRecordForAudit(supabase, 'sanction', id)
  const { data, error } = await supabase
    .from('sanction')
    .update(sanction)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error

  await createAuditLog({
    tableName: 'sanction',
    recordId: id,
    action: 'update',
    oldValues: oldValues || undefined,
    newValues: sanction as Record<string, unknown>,
    description: 'Actualizar sanción',
  })

  return data
}

export async function deleteSanction(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const oldValues = await getDbRecordForAudit(supabase, 'sanction', id)
  const { error } = await supabase
    .from('sanction')
    .delete()
    .eq('id', id)
  
  if (error) throw error

  await createAuditLog({
    tableName: 'sanction',
    recordId: id,
    action: 'delete',
    oldValues: oldValues || undefined,
    description: 'Eliminar sanción',
  })
}

// Función para limpiar TODOS los datos de planilla (goles, tarjetas, sanciones)
// Mantiene los partidos y equipos, y pone todos los partidos como "programado"
export async function clearAllMatchData(): Promise<{ goalsDeleted: number; cardsDeleted: number; sanctionsDeleted: number; matchesReset: number }> {
  const supabase = getSupabaseClient()
  
  // Contar antes de borrar
  const { count: goalsCount } = await supabase.from('goal').select('*', { count: 'exact', head: true })
  const { count: cardsCount } = await supabase.from('card').select('*', { count: 'exact', head: true })
  const { count: sanctionsCount } = await supabase.from('sanction').select('*', { count: 'exact', head: true })
  const { count: matchesCount } = await supabase.from('match').select('*', { count: 'exact', head: true }).neq('status', 'programado')
  
  // Borrar todos los datos de planilla
  await supabase.from('goal').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('card').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('sanction').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  // Poner todos los partidos como "programado"
  await supabase.from('match').update({ status: 'programado' }).neq('status', 'programado')

  await createAuditLog({
    tableName: 'match',
    recordId: '00000000-0000-0000-0000-000000000000',
    action: 'update',
    newValues: { status: 'programado' },
    description: 'Limpiar datos de planilla (bulk) y resetear partidos a programado',
  })
  
  return {
    goalsDeleted: goalsCount || 0,
    cardsDeleted: cardsCount || 0,
    sanctionsDeleted: sanctionsCount || 0,
    matchesReset: matchesCount || 0
  }
}

// Get players near suspension with additional data about last match day cards
export async function getPlayersNearSuspension(tournamentId: string, threshold: number): Promise<Array<{ 
  player: Player; 
  team: Team; 
  yellowCards: number; 
  yellowCardsInLastMatch: number;
  matchDayNumber: number | null;
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
        matchDayNumber: null,
        status,
      }
    }).filter((p): p is NonNullable<typeof p> => p !== null).sort((a, b) => (b?.yellowCards ?? 0) - (a?.yellowCards ?? 0))
    
    return result as Array<{ 
      player: Player; 
      team: Team; 
      yellowCards: number;
      yellowCardsInLastMatch: number;
      matchDayNumber: number | null;
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
  
  // Create map from playerId to matchDayNumber
  const playerMatchDayNumber = new Map(yellowCardsInLastMatch.map(c => [c.playerId, c.matchDayNumber]))
  
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
  const result: Array<{ player: Player; team: Team; yellowCards: number; yellowCardsInLastMatch: number; matchDayNumber: number | null; status: 'normal' | 'observation' | 'at_limit' }> = []
  
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
      player: {
        id: player.id,
        teamId: player.team_id,
        firstName: player.first_name,
        lastName: player.last_name,
        photoUrl: player.photo_url,
        shirtNumber: player.shirt_number,
        position: player.position,
        active: player.active,
        createdAt: player.created_at,
        updatedAt: player.updated_at,
      },
      team: player.team,
      yellowCards: yellowCount,
      yellowCardsInLastMatch: yellowInLast,
      matchDayNumber: playerMatchDayNumber.get(player.id) || null,
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

  await createAuditLog({
    tableName: 'document',
    recordId: data.id,
    action: 'create',
    newValues: doc as Record<string, unknown>,
    description: 'Crear documento',
  })

  return data
}

export async function updateDocument(id: string, doc: Partial<Document>): Promise<Document> {
  const supabase = getSupabaseClient()
  const oldValues = await getDbRecordForAudit(supabase, 'document', id)
  const { data, error } = await supabase
    .from('document')
    .update(doc)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error

  await createAuditLog({
    tableName: 'document',
    recordId: id,
    action: 'update',
    oldValues: oldValues || undefined,
    newValues: doc as Record<string, unknown>,
    description: 'Actualizar documento',
  })

  return data
}

export async function deleteDocument(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const oldValues = await getDbRecordForAudit(supabase, 'document', id)
  const { error } = await supabase
    .from('document')
    .delete()
    .eq('id', id)
  
  if (error) throw error

  await createAuditLog({
    tableName: 'document',
    recordId: id,
    action: 'delete',
    oldValues: oldValues || undefined,
    description: 'Eliminar documento',
  })
}



// Audit Log
export async function createAuditLog(log: {
  tableName: string
  recordId: string
  action: 'create' | 'update' | 'delete'
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  description?: string
}): Promise<void> {
  // En modo demo, no guardar logs
  if (env.demoMode) return
  
  const supabase = getSupabaseClient()
  
  // Get current user from auth store
  const authData = localStorage.getItem('auth-storage')
  let adminUserId: string | null = null
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      adminUserId = parsed.state?.user?.id || null
    } catch {}
  }
  
  const { error } = await supabase
    .from('audit_log')
    .insert({
      admin_user_id: adminUserId,
      table_name: log.tableName,
      record_id: log.recordId,
      action: log.action,
      old_values: log.oldValues ? JSON.stringify(log.oldValues) : null,
      new_values: log.newValues ? JSON.stringify(log.newValues) : null,
      description: log.description,
    })
  
  if (error) {
    console.error('Audit log error:', error)
  }
}

export interface AuditLog {
  id: string
  admin_user_id: string | null
  admin_user_name: string | null
  table_name: string
  record_id: string
  action: 'create' | 'update' | 'delete'
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  description: string | null
  created_at: string
}

export async function getAuditLogs(options?: {
  tableName?: string
  limit?: number
}): Promise<AuditLog[]> {
  if (env.demoMode) return []
  
  const supabase = getSupabaseClient()
  
  // Join con admin_user para obtener nombre
  const { data, error } = await supabase
    .from('audit_log')
    .select('*, admin_user:admin_user_id(name, email)')
    .order('created_at', { ascending: false })
    .limit(options?.limit || 100)
  
  if (error) throw error
  
  if (!data) return []
  
  // Filtrar por tableName si aplica
  let logs = data
  if (options?.tableName) {
    logs = data.filter(l => l.table_name === options.tableName)
  }
  
  // Mapear para incluir nombre de usuario
  return logs.map(l => ({
    ...l,
    admin_user_name: l.admin_user?.name || l.admin_user?.email || null,
  }))
}

// Normalizar News de DB (snake_case) a App (camelCase)
function normalizeNewsFromDB(data: Record<string, unknown>[]): News[] {
  return (data || []).map((row) => ({
    id: row.id as string,
    tournamentId: row.tournament_id as string | null,
    title: row.title as string,
    message: row.message as string,
    type: row.type as NewsType,
    link: row.link as string | null,
    linkLabel: row.link_label as string | null,
    active: row.active as boolean,
    publishedAt: row.published_at as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }))
}

// News
export async function getActiveNews(_tournamentId?: string): Promise<News[]> {
  // Demo mode: return static notices
  if (env.demoMode) {
    const { notices: staticNotices } = await import('../lib/notices')
    return staticNotices.map(n => ({
      id: n.id,
      tournamentId: null,
      title: n.title,
      message: n.message,
      type: n.type,
      link: n.link || null,
      linkLabel: n.linkLabel || null,
      active: true,
      publishedAt: n.publishedAt,
      createdAt: n.publishedAt,
      updatedAt: n.publishedAt,
    })) as News[]
  }
  
  const supabase = getSupabaseClient()
const { data, error } = await supabase
  .from('news')
  .select('*')
  .order('published_at', { ascending: false })
  
if (error) throw error
return normalizeNewsFromDB(data || [])
}

export async function getNewsById(id: string): Promise<News | null> {
  if (env.demoMode) return null
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data ? normalizeNewsFromDB([data as Record<string, unknown>])[0] : null
}

// Normalizar campos de News a snake_case para Supabase
function normalizeNewsForDB(news: Partial<News>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  
  if (news.title !== undefined) result.title = news.title
  if (news.message !== undefined) result.message = news.message
  if (news.type !== undefined) result.type = news.type
  if (news.link !== undefined) result.link = news.link
  if (news.linkLabel !== undefined) result.link_label = news.linkLabel
  if (news.tournamentId !== undefined) result.tournament_id = news.tournamentId
  if (news.active !== undefined) result.active = news.active
  if (news.publishedAt !== undefined) result.published_at = news.publishedAt
  
  return result
}

export async function createNews(news: Partial<News>): Promise<News> {
  const supabase = getSupabaseClient()
  const dbData = normalizeNewsForDB(news)
  
  const { data, error } = await supabase
    .from('news')
    .insert(dbData)
    .select()
    .single()
  
  if (error) {
    // Error friendlier para schema cache desactualizado
    if (error.message.includes('schema cache') || error.message.includes('column')) {
      throw new Error(`Error de configuración: ${error.message}. Por favor, ejecutá en Supabase SQL Editor: SELECT * FROM news WHERE 1=0;`)
    }
    throw error
  }
  
  // Audit log
  await createAuditLog({
    tableName: 'news',
    recordId: data.id,
    action: 'create',
    newValues: news as Record<string, unknown>,
    description: `Crear noticia: ${news.title}`
  })
  
  return data
}

export async function updateNews(id: string, news: Partial<News>): Promise<News> {
  const supabase = getSupabaseClient()
  const dbData = normalizeNewsForDB(news)
  
  const { data, error } = await supabase
    .from('news')
    .update(dbData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    if (error.message.includes('schema cache') || error.message.includes('column')) {
      throw new Error(`Error de configuración: ${error.message}. Por favor, ejecutá en Supabase SQL Editor: SELECT * FROM news WHERE 1=0;`)
    }
    throw error
  }
  
  // Audit log
  await createAuditLog({
    tableName: 'news',
    recordId: id,
    action: 'update',
    newValues: news as Record<string, unknown>,
    description: `Actualizar noticia: ${news.title}`
  })
  
  return data
}

export async function deleteNews(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  
  // Audit log
  await createAuditLog({
    tableName: 'news',
    recordId: id,
    action: 'delete',
    description: 'Eliminar noticia'
  })
}
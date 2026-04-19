// Tipos del dominio del torneo

// Enums
export type MatchStatus = 'programado' | 'reprogramado' | 'jugado' | 'suspendido'
export type CardType = 'amarilla' | 'roja'
export type SanctionStatus = 'vigente' | 'cumplida' | 'anulada'
export type AdminRole = 'admin' | 'carga_datos'
export type TournamentStatus = 'borrador' | 'activo' | 'finalizado'
export type DocumentType = 'reglamento' | 'acta' | 'convocatoria' | 'otro'
export type SanctionOrigin = 'roja' | 'acumulacion_amarillas' | 'amarillas_consecutivas' | 'manual'
export type NewsType = 'info' | 'warning' | 'success' | 'urgent'

// News (Noticias/Avisos)
export interface News {
  id: string
  tournamentId: string | null
  title: string
  message: string
  type: NewsType
  link: string | null
  linkLabel: string | null
  active: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
  // DB columns (snake_case)
  tournament_id?: string
  link_label?: string
  published_at?: string
}

// Tournament
export interface Tournament {
  id: string
  name: string
  year: number
  description: string | null
  status: TournamentStatus
  regulationUrl: string | null
  // Habilitar equipo "LIBRE" en partidos
  libreTeamEnabled: boolean
  // Suspensión por amarillas (no consecutivas)
  yellowCardSuspensionThreshold: number
  // Suspensión por 2 amarillas consecutivas
  consecutiveYellowSuspension: number
  // Suspensión por tarjeta roja (partidos)
  redCardSuspensionMatches: number
  // DB columns (snake_case)
  yellow_card_suspension_threshold?: number
  consecutive_yellow_suspension?: number
  red_card_suspension_matches?: number
  createdAt: string
  updatedAt: string
}

// Team
export interface Team {
  id: string
  tournamentId: string
  name: string
  description: string | null
  shieldUrl: string | null
  teamPhotoUrl: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

// Player
export interface Player {
  id: string
  teamId: string
  firstName: string
  lastName: string
  photoUrl: string | null
  shirtNumber: number | null
  position: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

// Match Day (Fecha)
export interface MatchDay {
  id: string
  tournamentId: string
  number: number
  title: string | null
  published: boolean
  referenceDate: string | null
  freeTeamId: string | null  // Equipo que no juega esta jornada
  notes: string | null
  createdAt: string
  updatedAt: string
}

// Match (Partido)
export interface Match {
  id: string
  matchDayId: string
  matchDayNumber?: string | number | null
  homeTeamId: string
  awayTeamId: string
  scheduledAt: string | null
  venue: string | null
  status: MatchStatus
  homeGoals: number | null
  awayGoals: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

// Goal (Gol)
export interface Goal {
  id: string
  matchId: string
  playerId: string
  teamId: string
  quantity: number
  createdAt: string
}

// Card (Tarjeta)
export interface Card {
  id: string
  matchId: string
  playerId: string
  teamId: string
  type: CardType
  minute: number | null
  createdAt: string
}

// Sanction (Sancion)
export interface Sanction {
  id: string
  playerId: string
  teamId: string
  reason: string
  totalMatches: number
  matchesServed: number
  status: SanctionStatus
  origin: SanctionOrigin | null
  originMatchDay?: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

// Document (Documento)
export interface Document {
  id: string
  tournamentId: string
  type: DocumentType
  title: string
  fileUrl: string | null
  content?: string | null  // For HTML content in demo mode
  active: boolean
  createdAt: string
  updatedAt: string
}

// Admin User
export interface AdminUser {
  id: string
  email: string
  name: string
  role: AdminRole
  active: boolean
  createdAt: string
  updatedAt: string
}

// Tipos adicionales para resultados compuestos
export interface MatchWithTeams extends Match {
  homeTeam: Team
  awayTeam: Team
}

export interface PlayerWithTeam extends Player {
  team: Team
}

export interface MatchDayWithMatches extends MatchDay {
  matches: MatchWithTeams[]
}

export interface StandingEntry {
  position: number
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface TopScorer {
  player: Player
  team: Team
  totalGoals: number
}

export interface PlayerAtRisk {
  player: Player
  team: Team
  yellowCards: number
  status: 'normal' | 'observation' | 'at_limit' | 'suspended'
}
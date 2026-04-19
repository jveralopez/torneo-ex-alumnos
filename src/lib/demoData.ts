import type { Player, Team, MatchDay, Match, Goal, Card, Sanction, Document, Tournament } from '../types/domain'

// ============================================
// DATOS DE DEMO PARA VISUALIZACIÓN SIN SUPABASE
// ============================================

const TEAM_NAMES = [
  'Los Halcones', 'Las Águilas', 'Los Tigres', 'Los Leones',
  'Los Diablos', 'Los Toros', 'Los Guerreros', 'Los Eagles',
  'Los Sharks', 'Los Panthers', 'Los Wolves', 'Los Bears'
]

const PLAYER_FIRST_NAMES = [
  'Juan', 'Carlos', 'Luis', 'José', 'Miguel', 'Antonio', 'Francisco', 'Pedro',
  'Alejandro', 'Diego', 'Fernando', 'Ricardo', 'Eduardo', 'Gabriel', 'Alberto',
  'Oscar', 'Sergio', 'Andrés', 'Roberto', 'Javier', 'Matías', 'Emiliano',
  'Bruno', 'Thiago', 'Lionel', 'Cristiano', 'Kylian', 'Erling'
]

const PLAYER_LAST_NAMES = [
  'Pérez', 'García', 'Martínez', 'López', 'Rodríguez', 'González', 'Sánchez', 'Ramírez',
  'Torres', 'Flores', 'Ruiz', 'Díaz', 'Hernández', 'Cruz', 'Morales', 'Ortiz',
  'Jiménez', 'Vega', 'Mendoza', 'Castillo', 'Romero', 'Herrera', 'Aguilar', 'Núñez',
  'Silva', 'Medina', 'Reyes', 'Castro', 'Vargas', 'Navarro'
]

const MATCH_VENUES = [
  'Cancha Principal', 'Cancha Auxiliar 1', 'Cancha Auxiliar 2', 
  'Estadio Municipal', 'Club Deportivo'
]

const POSITIONS = ['Arquero', 'Defensor', 'Mediocampista', 'Delantero']

// Equipos de demo
export const demoTeams: Team[] = TEAM_NAMES.map((name, i) => ({
  id: `team-${i + 1}`,
  tournamentId: 'demo-tournament',
  name,
  description: `Equipo de fútbol del año ${2024}`,
  shieldUrl: null,
  teamPhotoUrl: null,
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))

// Jugadores de demo - 15 por equipo
export const demoPlayers: Player[] = demoTeams.flatMap((team, teamIndex) => {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `player-${team.id}-${i + 1}`,
    teamId: team.id,
    firstName: PLAYER_FIRST_NAMES[(teamIndex * 15 + i) % PLAYER_FIRST_NAMES.length],
    lastName: PLAYER_LAST_NAMES[(teamIndex * 15 + i) % PLAYER_LAST_NAMES.length],
    photoUrl: null,
    shirtNumber: i + 1,
    position: POSITIONS[i % 4],
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))
})

// Fechas de demo - 4 fechas jugadas + 6 programadas
export const demoMatchDays: MatchDay[] = Array.from({ length: 10 }, (_, i) => ({
  id: `matchday-${i + 1}`,
  tournamentId: 'demo-tournament',
  number: i + 1,
  title: `Fecha ${i + 1}`,
  published: true,
  referenceDate: new Date(Date.now() + (i - 4) * 7 * 24 * 60 * 60 * 1000).toISOString(),
  freeTeamId: null,
  notes: i < 4 ? `Fecha disputada` : `Fecha programada`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))

// Resultados más realistas para 4 fechas jugadas (4 partidos por fecha = 16 partidos)
const MATCH_RESULTS: Array<{ home: number; away: number }> = [
  // Fecha 1
  { home: 3, away: 1 }, { home: 2, away: 2 }, { home: 0, away: 1 }, { home: 4, away: 0 },
  // Fecha 2
  { home: 1, away: 1 }, { home: 2, away: 3 }, { home: 0, away: 0 }, { home: 5, away: 2 },
  // Fecha 3
  { home: 2, away: 1 }, { home: 1, away: 2 }, { home: 3, away: 3 }, { home: 1, away: 0 },
  // Fecha 4
  { home: 0, away: 2 }, { home: 2, away: 1 }, { home: 1, away: 1 }, { home: 3, away: 1 },
]

// Partidos de demo - 4 fechas jugadas
export const demoMatches: Match[] = demoMatchDays.flatMap((matchDay, dayIndex) => {
  const matchesInDay = 4
  return Array.from({ length: matchesInDay }, (_, i) => {
    const matchIndex = dayIndex * matchesInDay + i
    const homeTeam = demoTeams[(dayIndex * 2 + i) % demoTeams.length]
    const awayTeam = demoTeams[(dayIndex * 2 + i + 1) % demoTeams.length]
    
    const isPlayed = dayIndex < 4
    const result = isPlayed ? MATCH_RESULTS[matchIndex] : { home: 0, away: 0 }
    
    return {
      id: `match-${matchDay.id}-${i + 1}`,
      matchDayId: matchDay.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      scheduledAt: new Date(Date.now() + (dayIndex - 4) * 7 * 24 * 60 * 60 * 1000 + i * 3 * 60 * 60 * 1000).toISOString(),
      venue: MATCH_VENUES[i % MATCH_VENUES.length],
      status: isPlayed ? 'jugado' : 'programado' as const,
      homeGoals: isPlayed ? result.home : null,
      awayGoals: isPlayed ? result.away : null,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
})

// Goles de demo - distribuidos entre jugadores
export const demoGoals: Goal[] = demoMatches
  .filter(m => m.status === 'jugado' && m.homeGoals != null && m.awayGoals != null)
  .flatMap(match => {
    const goals: Goal[] = []
    
    // Generar goles para equipo local
    for (let i = 0; i < (match.homeGoals || 0); i++) {
      const teamPlayers = demoPlayers.filter(p => p.teamId === match.homeTeamId)
      const forwardPlayers = teamPlayers.filter(p => p.position === 'Delantero' || p.position === 'Mediocampista')
      const players = forwardPlayers.length > 0 ? forwardPlayers : teamPlayers
      const randomPlayer = players[Math.floor(Math.random() * players.length)]
      
      if (randomPlayer) {
        goals.push({
          id: `goal-${match.id}-home-${i + 1}`,
          matchId: match.id,
          playerId: randomPlayer.id,
          teamId: match.homeTeamId,
          quantity: 1,
          createdAt: new Date().toISOString(),
        })
      }
    }
    
    // Generar goles para equipo visitante
    for (let i = 0; i < (match.awayGoals || 0); i++) {
      const teamPlayers = demoPlayers.filter(p => p.teamId === match.awayTeamId)
      const forwardPlayers = teamPlayers.filter(p => p.position === 'Delantero' || p.position === 'Mediocampista')
      const players = forwardPlayers.length > 0 ? forwardPlayers : teamPlayers
      const randomPlayer = players[Math.floor(Math.random() * players.length)]
      
      if (randomPlayer) {
        goals.push({
          id: `goal-${match.id}-away-${i + 1}`,
          matchId: match.id,
          playerId: randomPlayer.id,
          teamId: match.awayTeamId,
          quantity: 1,
          createdAt: new Date().toISOString(),
        })
      }
    }
    
    return goals
  })

// Tarjetas de demo - más realistas
export const demoCards: Card[] = demoMatches
  .filter(m => m.status === 'jugado')
  .flatMap(match => {
    const cards: Card[] = []
    // 2-4 tarjetas por partido
    const numCards = 2 + Math.floor(Math.random() * 3)
    
    for (let i = 0; i < numCards; i++) {
      const isHomeTeam = i < Math.floor(numCards / 2)
      const teamId = isHomeTeam ? match.homeTeamId : match.awayTeamId
      const teamPlayers = demoPlayers.filter(p => p.teamId === teamId)
      const randomPlayer = teamPlayers[Math.floor(Math.random() * teamPlayers.length)]
      
      // 20% probabilidad de roja, sino amarilla
      const isRed = i === 0 && Math.random() < 0.2
      
      if (randomPlayer) {
        cards.push({
          id: `card-${match.id}-${i + 1}`,
          matchId: match.id,
          playerId: randomPlayer.id,
          teamId,
          type: isRed ? 'roja' : 'amarilla' as const,
          minute: 15 + Math.floor(Math.random() * 60),
          createdAt: new Date().toISOString(),
        })
      }
    }
    return cards
  })

// Sanciones de demo
export const demoSanctions: Sanction[] = [
  {
    id: 'sanction-1',
    playerId: demoPlayers.find(p => p.lastName === 'Pérez' && p.teamId === demoTeams[0].id)?.id || 'player-team-1-3',
    teamId: demoTeams[0].id,
    reason: 'Tarjeta roja directa - juego brusco',
    totalMatches: 2,
    matchesServed: 1,
    status: 'vigente' as const,
    origin: 'roja' as const,
    notes: 'Expulsado en Fecha 2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sanction-2',
    playerId: demoPlayers.find(p => p.lastName === 'García' && p.teamId === demoTeams[1].id)?.id || 'player-team-2-5',
    teamId: demoTeams[1].id,
    reason: 'Acumulación de tarjetas amarillas',
    totalMatches: 1,
    matchesServed: 0,
    status: 'vigente' as const,
    origin: 'acumulacion_amarillas' as const,
    notes: '3 amarillas acumuladas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sanction-3',
    playerId: demoPlayers.find(p => p.lastName === 'Martínez' && p.teamId === demoTeams[2].id)?.id || 'player-team-3-7',
    teamId: demoTeams[2].id,
    reason: 'Tarjeta roja directa - conducta violenta',
    totalMatches: 3,
    matchesServed: 2,
    status: 'vigente' as const,
    origin: 'roja' as const,
    notes: 'Expulsado en Fecha 1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Documentos de demo (reglamento)
export const demoDocuments: Document[] = [
  {
    id: 'doc-regulation-1',
    tournamentId: 'demo-tournament',
    type: 'reglamento',
    title: 'Reglamento General del Torneo 2024',
    fileUrl: null, // En demo mode seria null, pero el sistema mostrara HTML
    content: `
      <h2>Reglamento del Torneo de Ex Alumnos 2024</h2>
      
      <h3>1. Sistema de Competencia</h3>
      <p>El torneo se disputará con formato de todos contra todos, a una sola vuelta, totalizando 11 fechas.</p>
      
      <h3>2. Sistema de Puntuación</h3>
      <ul>
        <li>Victoria: 3 puntos</li>
        <li>Empate: 2 puntos</li>
        <li>Derrota: 1 punto</li>
        <li>No presentación: 0 puntos</li>
      </ul>
      
      <h3>3. Criterios de Desempate</h3>
      <ol>
        <li>Puntos obtenidos</li>
        <li>Diferencia de gol</li>
        <li>Goles a favor</li>
        <li>Resultado directo</li>
        <li>Sorteo</li>
      </ol>
      
      <h3>4. Sistema de Suspensión</h3>
      <p>El jugador que acumule <strong>3 tarjetas amarillas</strong> será suspendido automáticamente por 1 fecha.</p>
      <p>La tarjeta roja directa implica suspensión mínima de 1 fecha.</p>
      
      <h3>5. Reglamento de Juego</h3>
      <ul>
        <li>Duración: 2 tiempos de 25 minutos</li>
        <li>Tiempo de descanso: 5 minutos</li>
        <li>Se permiten hasta 5 cambios</li>
        <li>El partido no puede comenzar con menos de 7 jugadores</li>
      </ul>
    `,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

// Tournament info
export const demoTournament: Tournament = {
  id: 'demo-tournament',
  name: 'Torneo de Ex Alumnos',
  year: 2024,
  description: 'Torneo anual de fútbol 7 entre ex-alumnos del Colegio. ¡La competencia más esperada del año!',
  status: 'activo',
  regulationUrl: null,
  libreTeamEnabled: false,
  yellowCardSuspensionThreshold: 4,  // 4 amarillas no consecutivas = 1 fecha
  consecutiveYellowSuspension: 2,    // 2 amarillas consecutivas = 1 fecha
  redCardSuspensionMatches: 2,        // Roja directa = 2 fechas
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Funciones helper para acceder a datos de demo
export function getDemoMatchDays() {
  return demoMatchDays
}

export function getDemoVisibleMatchDays() {
  return demoMatchDays.filter(m => m.published)
}

export function getDemoPublishedMatchDays() {
  return demoMatchDays.filter(m => m.published)
}

export function getDemoMatches(matchDayId: string) {
  return demoMatches.filter(m => m.matchDayId === matchDayId)
}

export function getDemoPlayedMatches() {
  return demoMatches.filter(m => m.status === 'jugado')
}

export function getDemoRecentPlayedMatches(limit: number = 5) {
  return demoMatches
    .filter(m => m.status === 'jugado')
    .sort((a, b) => new Date(b.scheduledAt!).getTime() - new Date(a.scheduledAt!).getTime())
    .slice(0, limit)
}

export function getDemoNextMatchDay() {
  // Find first match day that has at least one match not played yet
  return demoMatchDays.find(md => {
    const matches = demoMatches.filter(m => m.matchDayId === md.id)
    return matches.some(m => m.status === 'programado')
  }) || null
}

export function getDemoPublicSanctions() {
  return demoSanctions.filter(s => s.status === 'vigente')
}

export function getDemoYellowCardsByPlayer() {
  const yellowCards = demoCards.filter(c => c.type === 'amarilla')
  const counts: Record<string, number> = {}
  
  yellowCards.forEach(card => {
    counts[card.playerId] = (counts[card.playerId] || 0) + 1
  })
  
  return Object.entries(counts).map(([playerId, count]) => ({ playerId, count }))
}

// Get yellow cards from the last played match day only
export function getDemoYellowCardsInLastMatchDay(): Array<{ playerId: string; count: number; matchId: string }> {
  // Find last played match day
  const playedMatchDays = demoMatchDays.filter(md => {
    const matches = demoMatches.filter(m => m.matchDayId === md.id && m.status === 'jugado')
    return matches.length > 0
  })
  
  if (playedMatchDays.length === 0) return []
  
  const lastMatchDay = playedMatchDays[playedMatchDays.length - 1]
  const lastMatchIds = demoMatches
    .filter(m => m.matchDayId === lastMatchDay.id && m.status === 'jugado')
    .map(m => m.id)
  
  const lastMatchDayYellowCards = demoCards.filter(c => 
    lastMatchIds.includes(c.matchId) && c.type === 'amarilla'
  )
  
  return lastMatchDayYellowCards.map(c => ({ playerId: c.playerId, count: 1, matchId: c.matchId }))
}

export function getDemoGoalsByPlayer() {
  const counts: Record<string, { player: Player | undefined; team: Team | undefined; totalGoals: number }> = {}
  
  demoGoals.forEach(goal => {
    if (!counts[goal.playerId]) {
      const player = demoPlayers.find(p => p.id === goal.playerId)
      const team = demoTeams.find(t => t.id === goal.teamId)
      counts[goal.playerId] = { player, team, totalGoals: 0 }
    }
    counts[goal.playerId].totalGoals += goal.quantity
  })
  
  return Object.values(counts).sort((a, b) => b.totalGoals - a.totalGoals)
}

export function getDemoAllPlayedMatchesWithTeams() {
  return demoMatches.filter(m => m.status === 'jugado')
}

export function getDemoTournamentStats() {
  const playedMatches = demoMatches.filter(m => m.status === 'jugado')
  const totalGoals = demoGoals.reduce((sum, g) => sum + g.quantity, 0)
  const yellowCards = demoCards.filter(c => c.type === 'amarilla').length
  const redCards = demoCards.filter(c => c.type === 'roja').length
  
  return {
    teams: demoTeams.length,
    players: demoPlayers.length,
    matchesPlayed: playedMatches.length,
    matchesTotal: demoMatches.length,
    goalsTotal: totalGoals,
    yellowCardsTotal: yellowCards,
    redCardsTotal: redCards,
  }
}

export function getDemoDocuments() {
  return demoDocuments
}

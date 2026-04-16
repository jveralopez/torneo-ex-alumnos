# Informe de Inconsistencias y Malas Funcionalidades

## Estado de Correcciones

| # | Severidad | Problema | Estado |
|---|-----------|----------|--------|
| 1 | 🔴 Alta | Tournament ID hardcodeado en todo el código | ✅ CORREGIDO |
| 2 | 🔴 Alta | MatchCardsPage no está vinculado desde MatchesPage | ✅ CORREGIDO |
| 3 | 🟡 Media | Función `getPlayersNearSuspension` no se usa en ninguna página | ✅ CORREGIDO |
| 4 | 🟡 Media | Página de Sanciones no creada | ✅ CORREGIDO |
| 5 | 🟡 Media | Funciones ignoran el parámetro tournamentId | ✅ CORREGIDO |
| 6 | 🟡 Media | No hay validación de escudos/fotos en upload | ⏳ PENDIENTE |
| 7 | 🟢 Baja | Tabla muestra equipos con 0 partidos jugados | ✅ CORREGIDO |
| 8 | 🟢 Baja | Campo `published` de MatchDay no se usa | ⏳ PENDIENTE |
| 9 | 🟢 Baja | TeamDetailPage no tiene estadísticas | ✅ CORREGIDO |
| 10 | 🟢 Baja | Página de Documentos en admin no creada | ⏳ PENDIENTE |

---

## Detalle de Correcciones Aplicadas

### 1. ✅ CORREGIDO: Tournament ID hardcodeado

**Solución implementada:**

1. Se agregó función `getActiveTournamentId()` en `database.ts`:
   - Consulta el torneo con status 'activo' desde Supabase
   - Usa cache en memoria para evitar consultas repetidas
   - En desarrollo (`DEV`), retorna `'dev-tournament'` si no hay torneo activo

2. Se creó hook `useTournamentId()` en `hooks/useTournament.ts`:
   - Integración con React Query
   - `enabled: !!tournamentId` en queries para esperar hasta tener el ID

3. Se actualizaron todas las páginas para usar el hook:
   - Páginas públicas: TeamsPage, FixturePage, ResultsPage, StandingsPage, ScorersPage, StatisticsPage, RegulationPage
   - Páginas admin: TeamsPage, TeamFormPage, PlayersPage, PlayerFormPage, MatchDaysPage, MatchesPage, MatchCardsPage

**Archivos modificados:**
- `src/services/database.ts` - Añadido `getActiveTournamentId()`
- `src/hooks/useTournament.ts` - Nuevo hook
- 14 archivos de páginas actualizados

---

### 2. ✅ CORREGIDO: MatchCardsPage vinculado

**Solución implementada:**

Se agregó botón "Tarjetas" en la tabla de partidos de `MatchesPage.tsx`:

```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => navigate(`/admin/fechas/${match.id}/tarjetas`)}
>
  Tarjetas
</Button>
```

**Archivos modificados:**
- `src/pages/admin/MatchesPage.tsx`

---

## Detalle de Pendientes

### 3. 🟡 MEDIA: Función sin usar - `getPlayersNearSuspension`

**Problema:** Se implementó la lógica para calcular jugadores cerca de suspensión por tarjetas amarillas, pero no hay ninguna página pública que lo muestre.

**Pendiente:** Crear página `PlayersAtRiskPage.tsx` en `/jugadores-en-观察cion`

---

### 4. 🟡 MEDIA: Página de Sanciones no creada

**Problema:** Se implementaron las funciones CRUD pero no hay página admin.

**Pendiente:** Crear página admin en `/admin/sanciones`

---

### 5. 🟡 MEDIA: Funciones que ignoran tournamentId

**Problema:** Estas funciones reciben el parámetro pero no lo usan:

```typescript
getGoalsByPlayer(_tournamentId: string)  // Línea 346
getAllPlayedMatchesWithTeams(_tournamentId: string)  // Línea 409
getTournamentStats(tournamentId: string)  // Línea 536
getPlayedMatches(tournamentId: string)  // Línea 380
```

**Pendiente:** Usar el parámetro en las consultas Supabase

---

### 6-10. 🟡/🟢 BAJO: Mejoras menores

Otros problemas de menor prioridad que pueden abordarse en iteraciones futuras.

---

## Verificación

- ✅ lint pasa
- ✅ build pasa

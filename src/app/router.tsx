import { Navigate, Route, Routes } from 'react-router-dom'

import { AdminLayout } from '../components/layout/AdminLayout'
import { PublicLayout } from '../components/layout/PublicLayout'
import { AdminGuard } from '../modules/auth/AdminGuard'
import { DashboardPage } from '../pages/admin/DashboardPage'
import { LoginPage } from '../pages/admin/LoginPage'
import { TeamsPage as AdminTeamsPage } from '../pages/admin/TeamsPage'
import { TeamFormPage } from '../pages/admin/TeamFormPage'
import { TeamEditPage } from '../pages/admin/TeamEditPage'
import { PlayersPage } from '../pages/admin/PlayersPage'
import { PlayerFormPage } from '../pages/admin/PlayerFormPage'
import { MatchDaysPage } from '../pages/admin/MatchDaysPage'
import { MatchesPage } from '../pages/admin/MatchesPage'
import { MatchCardsPage } from '../pages/admin/MatchCardsPage'
import { MatchReportPage } from '../pages/admin/MatchReportPage'
import { SanctionsPage } from '../pages/admin/SanctionsPage'
import { DocumentsPage } from '../pages/admin/DocumentsPage'
import { NewsPage } from '../pages/admin/NewsPage'
import { SettingsPage } from '../pages/admin/SettingsPage'
import { AuditLogsPage } from '../pages/admin/AuditLogsPage'
import { HomePage } from '../pages/public/HomePage'
import { FixturePage } from '../pages/public/FixturePage'
import { ResultsPage } from '../pages/public/ResultsPage'
import { StandingsPage } from '../pages/public/StandingsPage'
import { ScorersPage } from '../pages/public/ScorersPage'
import { TeamsPage } from '../pages/public/TeamsPage'
import { TeamDetailPage } from '../pages/public/TeamDetailPage'
import { RegulationPage } from '../pages/public/RegulationPage'
import { StatisticsPage } from '../pages/public/StatisticsPage'
import { PlayersAtRiskPage } from '../pages/public/PlayersAtRiskPage'
import { PublicSanctionsPage } from '../pages/public/PublicSanctionsPage'
import { UiPreviewPage } from '../pages/public/UiPreviewPage'
import { appRoutes } from '../utils/routes'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={appRoutes.home} element={<HomePage />} />
        <Route path={appRoutes.fixture} element={<FixturePage />} />
        <Route path={appRoutes.results} element={<ResultsPage />} />
        <Route path={appRoutes.standings} element={<StandingsPage />} />
        <Route path={appRoutes.scorers} element={<ScorersPage />} />
        <Route path={appRoutes.teams} element={<TeamsPage />} />
        <Route path={appRoutes.teamDetail} element={<TeamDetailPage />} />
        <Route path={appRoutes.regulation} element={<RegulationPage />} />
        <Route path={appRoutes.statistics} element={<StatisticsPage />} />
        <Route path={appRoutes.playersAtRisk} element={<PlayersAtRiskPage />} />
        <Route path={appRoutes.publicSanctions} element={<PublicSanctionsPage />} />
        <Route path="/ui-preview" element={<UiPreviewPage />} />
      </Route>

      <Route path={appRoutes.adminLogin} element={<LoginPage />} />

      <Route
        path={appRoutes.admin}
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<DashboardPage />} />
        
        {/* Equipos */}
        <Route path="equipos" element={<AdminTeamsPage />} />
        <Route path="equipos/nuevo" element={<TeamFormPage />} />
        <Route path="equipos/:id" element={<TeamEditPage />} />

        {/* Jugadores */}
        <Route path="jugadores" element={<PlayersPage />} />
        <Route path="jugadores/nuevo" element={<PlayerFormPage />} />

        {/* Fechas y Partidos */}
        <Route path="fechas" element={<MatchDaysPage />} />
        <Route path="fechas/:id" element={<MatchesPage />} />
        <Route path="fechas/:id/tarjetas" element={<MatchCardsPage />} />
        <Route path="fechas/:id/planilla" element={<MatchReportPage />} />
        
        {/* Sanciones */}
        <Route path="sanciones" element={<SanctionsPage />} />
        
        {/* Documentos */}
        <Route path="documentos" element={<DocumentsPage />} />
        
        {/* Noticias */}
        <Route path="noticias" element={<NewsPage />} />
        
        {/* Configuración */}
        <Route path="configuracion" element={<SettingsPage />} />

        {/* Auditoria */}
        <Route path="auditoria" element={<AuditLogsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={appRoutes.home} replace />} />
    </Routes>
  )
}

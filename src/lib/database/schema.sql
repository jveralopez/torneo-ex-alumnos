-- Schema de base de datos para el Torneo de Ex Alumnos
-- Este archivo puede ejecutarse en el editor SQL de Supabase

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE match_status AS ENUM ('programado', 'reprogramado', 'jugado', 'suspendido');
CREATE TYPE card_type AS ENUM ('amarilla', 'roja');
CREATE TYPE sanction_status AS ENUM ('vigente', 'cumplida', 'anulada');
CREATE TYPE admin_role AS ENUM ('admin', 'carga_datos');
CREATE TYPE tournament_status AS ENUM ('borrador', 'activo', 'finalizado');

-- =============================================
-- TABLAS
-- =============================================

-- Tournament
CREATE TABLE tournament (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
    description TEXT,
    status tournament_status NOT NULL DEFAULT 'borrador',
    regulation_url TEXT,
    yellow_card_suspension_threshold INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team
CREATE TABLE team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    shield_url TEXT,
    team_photo_url TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Player
CREATE TABLE player (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    photo_url TEXT,
    shirt_number INTEGER CHECK (shirt_number IS NULL OR (shirt_number >= 1 AND shirt_number <= 99)),
    position TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Match Day (Fecha)
CREATE TABLE match_day (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    number INTEGER NOT NULL CHECK (number >= 1),
    title TEXT,
    visible_publicly BOOLEAN NOT NULL DEFAULT false,
    published BOOLEAN NOT NULL DEFAULT false,
    reference_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tournament_id, number)
);

-- Match (Partido)
CREATE TABLE match (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_day_id UUID NOT NULL REFERENCES match_day(id) ON DELETE CASCADE,
    home_team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    away_team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ,
    venue TEXT,
    status match_status NOT NULL DEFAULT 'programado',
    home_goals INTEGER CHECK (home_goals IS NULL OR home_goals >= 0),
    away_goals INTEGER CHECK (away_goals IS NULL OR away_goals >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

-- Goal (Gol)
CREATE TABLE goal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES player(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Card (Tarjeta)
CREATE TABLE card (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES player(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    type card_type NOT NULL,
    minute INTEGER CHECK (minute IS NULL OR (minute >= 0 AND minute <= 120)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sanction (Sancion)
CREATE TABLE sanction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES player(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    total_matches INTEGER NOT NULL CHECK (total_matches >= 1),
    matches_served INTEGER NOT NULL DEFAULT 0 CHECK (matches_served >= 0),
    status sanction_status NOT NULL DEFAULT 'vigente',
    origin TEXT CHECK (origin IN ('roja', 'acumulacion_amarillas', 'manual')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document (Documento - reglamento, etc.)
CREATE TABLE document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('reglamento', 'acta', 'convocatoria', 'otro')),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin User (Usuario administrador)
CREATE TABLE admin_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role admin_role NOT NULL DEFAULT 'carga_datos',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDICES
-- =============================================

CREATE INDEX idx_team_tournament ON team(tournament_id);
CREATE INDEX idx_player_team ON player(team_id);
CREATE INDEX idx_match_day_tournament ON match_day(tournament_id);
CREATE INDEX idx_match_match_day ON match(match_day_id);
CREATE INDEX idx_match_home_team ON match(home_team_id);
CREATE INDEX idx_match_away_team ON match(away_team_id);
CREATE INDEX idx_match_status ON match(status);
CREATE INDEX idx_goal_match ON goal(match_id);
CREATE INDEX idx_goal_player ON goal(player_id);
CREATE INDEX idx_card_match ON card(match_id);
CREATE INDEX idx_card_player ON card(player_id);
CREATE INDEX idx_sanction_player ON sanction(player_id);
CREATE INDEX idx_sanction_status ON sanction(status);
CREATE INDEX idx_document_tournament ON document(tournament_id);

-- =============================================
-- FUNCIONES UTILITARIAS
-- =============================================

-- Actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_tournament_updated_at
    BEFORE UPDATE ON tournament
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_updated_at
    BEFORE UPDATE ON team
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_updated_at
    BEFORE UPDATE ON player
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_day_updated_at
    BEFORE UPDATE ON match_day
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_updated_at
    BEFORE UPDATE ON match
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sanction_updated_at
    BEFORE UPDATE ON sanction
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_updated_at
    BEFORE UPDATE ON document
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_user_updated_at
    BEFORE UPDATE ON admin_user
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Agregar tabla de Noticias/Avisos
-- Ejecutar este archivoSOLO si la tabla news no existe

-- News (Noticias/Avisos)
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournament(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'urgent')),
    link TEXT,
    link_label TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_news_tournament ON news(tournament_id);
CREATE INDEX IF NOT EXISTS idx_news_active ON news(active);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificar que se creó
SELECT 'News table created/verified' as result;
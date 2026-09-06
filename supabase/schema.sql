-- ============================================================
-- SLAM APP — Supabase Schema (Actualizado y Sincronizado)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. EVENTOS
CREATE TABLE IF NOT EXISTS eventos (
  id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre                    TEXT NOT NULL,
  descripcion               TEXT,
  fecha                     TIMESTAMPTZ NOT NULL,
  activo                    BOOLEAN DEFAULT FALSE,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  limite_finalistas         INT DEFAULT 3,
  votacion_activa           BOOLEAN DEFAULT FALSE,
  puntuaciones_activas      BOOLEAN DEFAULT FALSE,
  participante_activo_id    UUID,
  ronda_activa              INT DEFAULT 1,
  registro_pin_abierto      BOOLEAN DEFAULT TRUE,
  color_primario            TEXT DEFAULT '#7AE92B',
  color_secundario          TEXT DEFAULT '#12D1AE',
  color_fondo               TEXT DEFAULT '#0E1217',
  color_texto               TEXT DEFAULT '#F4F8FA',
  color_cabecera            TEXT DEFAULT '#0E1217',
  ubicacion                 TEXT,
  url_entradas              TEXT,
  url_cartel                TEXT,
  presentador               TEXT,
  artista_invitado          TEXT,
  votos_totales_registrados INT DEFAULT 0
);

-- Solo un evento activo a la vez
CREATE UNIQUE INDEX IF NOT EXISTS idx_un_evento_activo ON eventos (activo)
  WHERE activo = TRUE;

-- 2. PARTICIPANTES
CREATE TABLE IF NOT EXISTS participantes (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id        UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nombre           TEXT NOT NULL,
  orden            INT  NOT NULL,
  foto_url         TEXT,
  esta_votando     BOOLEAN DEFAULT FALSE,
  ronda            INT DEFAULT 1,
  puntuacion_final NUMERIC(4,2),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Clave foránea retardada para participante activo
ALTER TABLE eventos 
  DROP CONSTRAINT IF EXISTS fk_evento_participante_activo,
  ADD CONSTRAINT fk_evento_participante_activo 
  FOREIGN KEY (participante_activo_id) REFERENCES participantes(id) ON DELETE SET NULL;

-- 3. VOTACIONES
CREATE TABLE IF NOT EXISTS votaciones (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id       UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  puntuacion      NUMERIC(4,2) NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 10),
  ronda           INT NOT NULL DEFAULT 1,
  voter_token     TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  -- Un voter_token solo puede votar 1 vez por participante y ronda
  CONSTRAINT unique_vote_per_round UNIQUE (participante_id, voter_token, ronda)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE eventos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE votaciones    ENABLE ROW LEVEL SECURITY;

-- EVENTOS: todos leen, solo autenticado (admin) escribe
CREATE POLICY "eventos_select_all"
  ON eventos FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "eventos_admin_insert"
  ON eventos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "eventos_admin_update"
  ON eventos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "eventos_admin_delete"
  ON eventos FOR DELETE TO authenticated USING (true);

-- PARTICIPANTES: todos leen, solo admin escribe
CREATE POLICY "participantes_select_all"
  ON participantes FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "participantes_admin_insert"
  ON participantes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "participantes_admin_update"
  ON participantes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "participantes_admin_delete"
  ON participantes FOR DELETE TO authenticated USING (true);

-- VOTACIONES: todos leen y votan (anon puede insertar si evento y votación están activos)
CREATE POLICY "votaciones_select_all"
  ON votaciones FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "votaciones_insert_anon"
  ON votaciones FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM eventos
      WHERE id = evento_id AND activo = TRUE AND votacion_activa = TRUE
    )
  );

-- ============================================================
-- VISTA: resultados por participante y ronda
-- ============================================================
CREATE OR REPLACE VIEW resultados AS
  SELECT
    p.id                                              AS participante_id,
    p.nombre                                          AS participante,
    p.foto_url,
    p.orden,
    p.evento_id,
    e.nombre                                          AS evento,
    COALESCE(v.ronda, 1)                              AS ronda,
    COUNT(v.id)                                       AS num_votos,
    COALESCE(SUM(v.puntuacion), 0)                    AS puntuacion_total,
    ROUND(COALESCE(AVG(v.puntuacion), 0)::numeric, 2) AS puntuacion_media,
    RANK() OVER (
      PARTITION BY p.evento_id, COALESCE(v.ronda, 1)
      ORDER BY COALESCE(AVG(v.puntuacion), 0) DESC, COUNT(v.id) DESC
    )                                                 AS posicion
  FROM participantes p
  JOIN eventos e ON e.id = p.evento_id
  LEFT JOIN votaciones v ON v.participante_id = p.id
  GROUP BY p.id, p.nombre, p.foto_url, p.orden, p.evento_id, e.nombre, COALESCE(v.ronda, 1);

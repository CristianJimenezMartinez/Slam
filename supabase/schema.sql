-- ============================================================
-- SLAM APP — Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. EVENTOS
CREATE TABLE IF NOT EXISTS eventos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  fecha       TIMESTAMPTZ NOT NULL,
  activo      BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Solo un evento activo a la vez
CREATE UNIQUE INDEX idx_un_evento_activo ON eventos (activo)
  WHERE activo = TRUE;

-- 2. PARTICIPANTES
CREATE TABLE IF NOT EXISTS participantes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id  UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nombre     TEXT NOT NULL,
  orden      INT  NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VOTACIONES
CREATE TABLE IF NOT EXISTS votaciones (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id       UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  puntuacion      INT  NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 10),
  voter_token     TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  -- Un voter_token solo puede votar 1 vez por participante
  UNIQUE (participante_id, voter_token)
);

-- ============================================================
-- ROW LEVEL SECURITY
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

-- VOTACIONES: todos leen y votan (anon puede insertar)
-- La restricción UNIQUE evita doble voto por token+participante
-- Solo se puede votar si el evento está activo
CREATE POLICY "votaciones_select_all"
  ON votaciones FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "votaciones_insert_anon"
  ON votaciones FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM eventos
      WHERE id = evento_id AND activo = TRUE
    )
  );

-- ============================================================
-- REALTIME (habilitar para la tabla votaciones)
-- ============================================================
-- En Supabase Dashboard → Database → Replication
-- Habilitar "Source" para la tabla votaciones

-- ============================================================
-- VISTA: resultados por participante (útil para el ranking)
-- ============================================================
CREATE OR REPLACE VIEW resultados AS
  SELECT
    p.id               AS participante_id,
    p.nombre           AS participante,
    p.orden,
    p.evento_id,
    e.nombre           AS evento,
    COUNT(v.id)        AS num_votos,
    COALESCE(SUM(v.puntuacion), 0)  AS puntuacion_total,
    COALESCE(AVG(v.puntuacion), 0)  AS puntuacion_media,
    RANK() OVER (
      PARTITION BY p.evento_id
      ORDER BY COALESCE(SUM(v.puntuacion), 0) DESC
    )                  AS posicion
  FROM participantes p
  JOIN eventos e ON e.id = p.evento_id
  LEFT JOIN votaciones v ON v.participante_id = p.id
  GROUP BY p.id, p.nombre, p.orden, p.evento_id, e.nombre;

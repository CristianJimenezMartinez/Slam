-- ==============================================================================
-- MIGRACIÓN DE CORRECCIÓN: SINCRONIZACIÓN DE BASE DE DATOS Y VISTA RESULTADOS
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ==============================================================================

-- 1. Actualización de columnas en tabla EVENTOS
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS votacion_activa BOOLEAN DEFAULT FALSE;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS puntuaciones_activas BOOLEAN DEFAULT FALSE;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS participante_activo_id UUID;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS ronda_activa INT DEFAULT 1;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS registro_pin_abierto BOOLEAN DEFAULT TRUE;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS color_primario TEXT DEFAULT '#7AE92B';
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS color_secundario TEXT DEFAULT '#12D1AE';
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS color_fondo TEXT DEFAULT '#0E1217';
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS color_texto TEXT DEFAULT '#F4F8FA';
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS color_cabecera TEXT DEFAULT '#0E1217';
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS ubicacion TEXT;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS url_entradas TEXT;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS url_cartel TEXT;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS presentador TEXT;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS artista_invitado TEXT;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS votos_totales_registrados INT DEFAULT 0;

-- 2. Actualización de columnas en tabla PARTICIPANTES
ALTER TABLE participantes ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE participantes ADD COLUMN IF NOT EXISTS esta_votando BOOLEAN DEFAULT FALSE;
ALTER TABLE participantes ADD COLUMN IF NOT EXISTS ronda INT DEFAULT 1;
ALTER TABLE participantes ADD COLUMN IF NOT EXISTS puntuacion_final NUMERIC(4,2);

-- 3. Actualización de columnas y tipo de puntuación en tabla VOTACIONES
ALTER TABLE votaciones ADD COLUMN IF NOT EXISTS ronda INT NOT NULL DEFAULT 1;
ALTER TABLE votaciones ALTER COLUMN puntuacion TYPE NUMERIC(4,2);

-- Restricción única por ronda
ALTER TABLE votaciones DROP CONSTRAINT IF EXISTS votaciones_participante_id_voter_token_key;
ALTER TABLE votaciones DROP CONSTRAINT IF EXISTS unique_vote_per_round;
ALTER TABLE votaciones ADD CONSTRAINT unique_vote_per_round UNIQUE (participante_id, voter_token, ronda);

-- 4. Recrear VISTA RESULTADOS con columna ronda, foto_url y ranking ordenado por media
DROP VIEW IF EXISTS resultados;
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

-- 5. Blindaje de seguridad en credenciales_voto (eliminar SELECT público indiscriminado)
DROP POLICY IF EXISTS "credenciales_voto_select_public" ON credenciales_voto;

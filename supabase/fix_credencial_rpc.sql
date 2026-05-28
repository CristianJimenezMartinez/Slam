-- ============================================================
-- HOTFIX CRÍTICO PARA EL EVENTO DE HOY
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- FIX 1: Borrar y recrear la función RPC
DROP FUNCTION IF EXISTS activar_credencial(uuid, text);

CREATE OR REPLACE FUNCTION activar_credencial(
  p_credencial_id UUID,
  p_voter_token TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  mensaje TEXT,
  out_evento_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_utilizada BOOLEAN;
  v_voter_token TEXT;
  v_evento_id UUID;
BEGIN
  SELECT cv.utilizada, cv.voter_token, cv.evento_id
  INTO v_utilizada, v_voter_token, v_evento_id
  FROM credenciales_voto cv
  WHERE cv.id = p_credencial_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Código QR de votación inválido o no encontrado.'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  IF v_utilizada AND v_voter_token <> p_voter_token THEN
    RETURN QUERY SELECT FALSE, 'Este código QR ya ha sido activado por otro teléfono móvil. Pide uno nuevo.'::TEXT, v_evento_id;
    RETURN;
  END IF;

  IF NOT v_utilizada THEN
    UPDATE credenciales_voto
    SET utilizada = TRUE,
        voter_token = p_voter_token,
        activated_at = NOW()
    WHERE id = p_credencial_id;
  END IF;

  RETURN QUERY SELECT TRUE, 'Credencial activada con éxito.'::TEXT, v_evento_id;
END;
$$;

-- FIX 2: Corregir constraint UNIQUE de votaciones para incluir ronda
ALTER TABLE votaciones DROP CONSTRAINT IF EXISTS unique_vote_per_round;
ALTER TABLE votaciones DROP CONSTRAINT IF EXISTS votaciones_participante_id_voter_token_key;
ALTER TABLE votaciones ADD CONSTRAINT unique_vote_per_round UNIQUE (participante_id, voter_token, ronda);

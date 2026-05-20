-- ============================================================
-- CREDENCIALES DE VOTO ÚNICO (PAPELITOS QR IMPRESOS)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Tabla de credenciales
CREATE TABLE IF NOT EXISTS credenciales_voto (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id    UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  voter_token  TEXT, -- Se asocia el token de localStorage del dispositivo que lo escaneó primero
  utilizada    BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE credenciales_voto ENABLE ROW LEVEL SECURITY;

-- 3. Políticas
-- Los administradores autenticados pueden hacer de todo
CREATE POLICY "credenciales_voto_admin_all"
  ON credenciales_voto FOR ALL TO authenticated USING (true);

-- Los usuarios anónimos y autenticados pueden leer la tabla (para validar códigos QR)
CREATE POLICY "credenciales_voto_select_public"
  ON credenciales_voto FOR SELECT TO anon, authenticated USING (true);

-- 4. Función RPC transaccional para validar y activar credenciales de forma atómica
CREATE OR REPLACE FUNCTION activar_credencial(
  p_credencial_id UUID,
  p_voter_token TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  mensaje TEXT,
  evento_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_utilizada BOOLEAN;
  v_voter_token TEXT;
  v_evento_id UUID;
BEGIN
  -- Buscar estado de la credencial
  SELECT utilizada, voter_token, cv.evento_id
  INTO v_utilizada, v_voter_token, v_evento_id
  FROM credenciales_voto cv
  WHERE cv.id = p_credencial_id;

  -- Validar existencia
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Código QR de votación inválido o no encontrado.'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Si ya ha sido activada por otro dispositivo diferente
  IF v_utilizada AND v_voter_token <> p_voter_token THEN
    RETURN QUERY SELECT FALSE, 'Este código QR ya ha sido activado por otro teléfono móvil. Pide uno nuevo.'::TEXT, v_evento_id;
    RETURN;
  END IF;

  -- Si no está utilizada, se activa de forma exclusiva para este dispositivo
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

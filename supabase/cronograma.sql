-- Tabla para el Calendario Anual / Cronograma
-- Permite publicidad de la temporada independiente de los eventos detallados
CREATE TABLE IF NOT EXISTS cronograma (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  nombre TEXT NOT NULL,
  url_entradas TEXT,
  url_foto TEXT, -- Se usa como imagen global de la temporada
  ubicacion TEXT,
  edicion TEXT,
  url_pase_temporada TEXT,
  color_primario TEXT,
  color_secundario TEXT,
  color_fondo TEXT,
  color_texto TEXT,
  color_cabecera TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE cronograma ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
DROP POLICY IF EXISTS "Permitir lectura pública de cronograma" ON cronograma;
CREATE POLICY "Permitir lectura pública de cronograma" ON cronograma
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permitir gestión a administradores autenticados" ON cronograma;
CREATE POLICY "Permitir gestión a administradores autenticados" ON cronograma
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

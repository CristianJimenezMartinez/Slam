-- Tabla para el Calendario Anual / Cronograma
-- Permite publicidad de la temporada independiente de los eventos detallados
CREATE TABLE IF NOT EXISTS cronograma (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  nombre TEXT NOT NULL,
  url_entradas TEXT,
  url_foto TEXT, -- Se usa como imagen global de la temporada
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE cronograma ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Permitir lectura pública de cronograma" ON cronograma
  FOR SELECT USING (true);

CREATE POLICY "Permitir gestión a administradores autenticados" ON cronograma
  FOR ALL USING (auth.role() = 'authenticated');

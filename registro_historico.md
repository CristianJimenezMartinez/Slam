# Plan de Registro Histórico y Estrategia SEO

Este documento detalla la visión para transformar el Poetry Slam Alicante en un archivo vivo de la poesía en la ciudad, permitiendo la gestión de múltiples temporadas y su indexación en buscadores.

## 1. Visión del Sistema
El objetivo es que cada temporada (2025, 2026, etc.) tenga su propia entidad en la base de datos, permitiendo navegar hacia atrás en el tiempo y consultar quiénes participaron, quiénes ganaron y qué eventos ocurrieron.

## 2. Interfaz Administrativa (Sub-pestañas)
Dentro de la pestaña de **Temporada**, añadiremos un segundo nivel de navegación:
- **Configuración Actual**: Gestión de la imagen, descripción y pase de temporada del año en curso.
- **Archivo de Temporadas**: Listado de años anteriores.
- **Gestión de Registros**: Herramienta para "cerrar" la temporada actual y archivarla formalmente.

## 4. El Proceso de "Post-Producción"
El archivo histórico se alimenta una vez finalizado el evento o la temporada:
1. **Carga Masiva**: El administrador podrá entrar en los eventos pasados y rellenar la "Ficha Literaria" de cada poeta antes del sellado final.
2. **Multimedia**: Se podrán vincular videos de **YouTube** (para el recital completo) y perfiles/links de **Instagram** (para que el poeta reciba su crédito).
3. **Biblioteca Semántica**: Al incluir el **Título** y el **Texto Completo**, el sitio se convierte en una base de datos de poesía contemporánea de Alicante indexable frase a frase.

## 5. Automatización SEO y Monetización
- **SEO Orgánico**: El texto de los poemas genera "Long Tail SEO" (búsquedas por fragmentos de texto), lo que garantiza tráfico constante de amantes de la poesía.
- **Potencial de Patrocinio**: Un archivo con miles de visitas de un nicho cultural tan específico es atractivo para sponsors, publicidad o colaboraciones con entidades culturales.
- **Cero Mantenimiento**: Una vez subida la información, Cloudflare y Angular se encargan de mantenerla viva y accesible sin costes adicionales de infraestructura.

## 6. Arquitectura de Datos (Campos Finales)
Necesitaremos registrar por cada participación:
- `nombre_poema`: string
- `texto_poema`: text
- `url_youtube`: string (opcional)
- `url_instagram`: string (opcional)

## 4. Estrategia SEO (Posicionamiento)
El registro histórico se convertirá en contenido de alto valor para Google:
- **Páginas Estáticas por Temporada**: Rutas como `/historia/2025` o `/historia/2026`.
- **Fichas de Poetas**: Un registro acumulativo de participaciones por poeta a lo largo de los años.
- **Generación de Meta-tags**: Títulos y descripciones dinámicas basadas en los resultados históricos de cada año.

## 5. Próximos Pasos Técnicos
1. [ ] Crear la tabla `temporadas` en Supabase.
2. [ ] Migrar los eventos actuales a la Temporada 2026.
3. [ ] Implementar el selector de temporadas en el Dashboard Admin.
4. [ ] Diseñar la vista pública de "Archivo Histórico".

---
> [!IMPORTANT]
> A medida que el sitio crezca, este registro funcionará como un muro de la fama, atrayendo tráfico orgánico mediante las búsquedas de los nombres de los poetas y los años de los torneos.

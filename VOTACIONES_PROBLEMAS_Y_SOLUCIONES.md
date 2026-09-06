# 🎯 DIAGNÓSTICO Y PLAN MAESTRO: SISTEMA DE VOTACIÓN
## POETRY SLAM ALICANTE — RESOLUCIÓN INTEGRAL DE INCONSISTENCIAS

> **Documento de Control y Seguimiento Paso a Paso**  
> Este documento cataloga con precisión quirúrgica todos los problemas detectados en el sistema de votaciones actual, las causas raíz, el impacto técnico/humano y la hoja de ruta para resolverlos paso a paso sin afectar al histórico de datos.

---

## 📑 ÍNDICE DE CONTENIDOS

1. [Definición Quirúrgica de los Problemas](#1-definición-quirúrgica-de-los-problemas)
   - [Problema 1: Ambigüedad Semántica y Escala Rígida (Palabras vs Números)](#problema-1-ambigüedad-semántica-y-escala-rígida-palabras-vs-números)
   - [Problema 2: Confusión en Criterio de Ganador (Porcentajes vs Medias vs Suma)](#problema-2-confusión-en-criterio-de-ganador-porcentajes-vs-medias-vs-suma)
   - [Problema 3: Votación Masiva Concurrente y Colisión en Cambio de Poeta](#problema-3-votación-masiva-concurrente-y-colisión-en-cambio-de-poeta)
   - [Problema 4: Empates Artificiales Masivos por Falta de Granularidad](#problema-4-empates-artificiales-masivos-por-falta-de-granularidad)
   - [Problema 5: Desajuste en la Numeración de Rondas (Frontend vs BD)](#problema-5-desajuste-en-la-numeración-de-rondas-frontend-vs-bd)
2. [Matriz de Impacto y Causa Raíz](#2-matriz-de-impacto-y-causa-raíz)
3. [Garantía de Compatibilidad con Datos Históricos](#3-garantía-de-compatibilidad-con-datos-históricos)
4. [Hoja de Ruta de Solución Paso a Paso](#4-hoja-de-ruta-de-solución-paso-a-paso)
   - [Fase A: Pizarra Digital Táctil de Voto (1 al 10 con Medios Puntos)](#fase-a-pizarra-digital-táctil-de-voto-1-al-10-con-medios-puntos)
   - [Fase B: Blindaje Concurrente y Validación de Poeta en Caliente](#fase-b-blindaje-concurrente-y-validación-de-poeta-en-caliente)
   - [Fase C: Proyector y Clasificaciones (Medias Claras y Podio)](#fase-c-proyector-y-clasificaciones-medias-claras-y-podio)
   - [Fase D: Normalización de Rondas en Live Control y BD](#fase-d-normalización-de-rondas-en-live-control-y-bd)

---

## 1. DEFINICIÓN QUIRÚRGICA DE LOS PROBLEMAS

### Problema 1: Ambigüedad Semántica y Escala Rígida (Palabras vs Números)
* **Situación Actual:** El votante ve 5 botones: `🌱 Suave (20%) = 2`, `👍 Bien (40%) = 4`, `⚡ Fuerte (60%) = 6`, `🔥 Fuego (80%) = 8`, `✨ Magia (100%) = 10`.
* **Causa Raíz:** Se intentó camuflar la naturaleza competitiva sustituyendo notas numéricas por adjetivos emocionales.
* **Impacto Real en la Sala:**
  1. **Confusión de Estilo vs Calificación:** Si un poeta recita un poema dulce, íntimo o melancólico con maestría absoluta, el público pulsa *"🌱 Suave"* pensando en el tono del poema... **asignándole un 2 sobre 10 (un suspenso devastador)**.
  2. **Eliminación del 50% de la Escala:** El público no puede votar `1, 3, 5, 7, 9` ni decimales (`7.5, 8.5, 9.5`). Si una actuación es notable pero no sobresaliente, el usuario duda entre 6 (bajo) y 8 (alto) sin opción intermedia.

---

### Problema 2: Confusión en Criterio de Ganador (Porcentajes vs Medias vs Suma)
* **Situación Actual:** En `/votar` se muestran porcentajes (`20%`, `40%`, `60%`, `80%`, `100%`), mientras que en `/puntuaciones` se calcula `AVG(puntuacion)` y `SUM(puntuacion)`.
* **Causa Raíz:** Falta de unificación visual entre la unidad de entrada (porcentaje gamificado) y la unidad de salida (nota media de 0 a 10).
* **Impacto Real en la Sala:**
  - El público y los poetas no entienden cómo se calcula la clasificación: ¿Gana quien tiene más votos brutos (si una actuación rápida recibe 50 votos y otra 35) o quien tiene mejor promedio?
  - **Criterio Oficial Necesario:** El ganador siempre debe determinarse por la **Nota Media Ponderada sobre 10** (número de 1 a 10 con dos decimales), informando además de la cantidad de votos emitidos para total transparencia.

---

### Problema 3: Votación Masiva Concurrente y Colisión en Cambio de Poeta
* **Situación Actual:** Al terminar un poema, 50 a 100 personas envían el voto simultáneamente en un lapso de 15 segundos.
* **Causa Raíz:**
  1. Si el presentador activa al siguiente poeta en el panel mientras un usuario rezagado está pulsando enviar, el cliente enviaba el ID del poeta antiguo o no validaba el estado actual del servidor.
  2. Si el usuario pulsaba repetidamente el botón de envío por lentitud de red, se disparaban múltiples peticiones POST concurrentes.
* **Impacto Real en la Sala:** Votos huérfanos, errores 23505 en consola y desorientación del votante que no sabe si su voto contó o no.

---

### Problema 4: Empates Artificiales Masivos por Falta de Granularidad
* **Situación Actual:** Al tener únicamente 5 notas posibles (`2, 4, 6, 8, 10`), la dispersión estadística es mínima.
* **Impacto Real en la Sala:** Tras 10 actuaciones, 4 o 5 poetas terminan empatados en notas idénticas (ej: `7.20` o `8.00`), obligando a desempates improvisados o decisiones arbitrarias que perjudican la legitimidad de la competición.

---

### Problema 5: Desajuste en la Numeración de Rondas (Frontend vs BD)
* **Situación Actual:**
  - `LiveControlComponent` maneja 3 rondas: `1` (La Quema), `2` (Clasificatoria), `3` (Gran Final).
  - La base de datos y la tabla `participantes` manejan rondas `1` y `2`.
  - `PuntuacionesComponent` tiene que hacer un mapeo forzado donde `rondaActual === 3` consulta los datos de `ronda = 2` en SQL.
* **Impacto Real en la Sala:** Complejidad innecesaria en el código, riesgo de errores al consultar el podio y dificultades para auditar eventos anteriores.

---

## 2. MATRIZ DE IMPACTO Y CAUSA RAÍZ

| Problema | Gravedad | Capa Afectada | Causa Raíz | Solución Técnica |
| :--- | :--- | :--- | :--- | :--- |
| **Palabras en vez de Notas** | 🔴 Crítica | Frontend (`votar-form`) | Gamificación con adjetivos | Pizarra digital 1-10 táctil con selector `.5` |
| **Empates Masivos** | 🔴 Crítica | BD / Proyección | Solo 5 opciones discretas | Escala continua de 1 a 10 con decimales |
| **Confusión en Métricas** | 🟡 Alta | UI / Proyector | Mezcla de `%` y medias | Unificación a `Nota Media / 10` y `Nº Votos` |
| **Colisión Concurrente** | 🔴 Crítica | Cliente / Supabase | Falta de validación en caliente | Verificación atómica antes de insertar y bloqueo UI |
| **Desfase de Rondas** | 🟡 Media | Live Control / BD | Diferente convención de índice | Normalización de convención de rondas |

---

## 3. GARANTÍA DE COMPATIBILIDAD CON DATOS HISTÓRICOS

Uno de los requisitos indispensables es **no romper ninguna puntuación de los eventos anteriores**:

1. **Estructura de la Base de Datos:**
   - La columna `votaciones.puntuacion` es de tipo `numeric(4,2)` en PostgreSQL.
   - Los votos anteriores guardados como `2.00`, `4.00`, `6.00`, `8.00`, `10.00` siguen siendo números válidos.
   - Los nuevos votos podrán guardar cualquier número (`7.00`, `8.50`, `9.00`, `9.50`).
2. **Cálculo de Resultados:**
   - La vista `resultados` ejecuta `AVG(puntuacion)`.
   - Las medias de eventos pasados se seguirán calculando exactamente igual que antes.
   - Los eventos nuevos disfrutarán de mayor precisión y cero empates artificiales.

---

## 4. HOJA DE RUTA DE SOLUCIÓN PASO A PASO

Para resolver todo esto con orden y control absoluto, ejecutaremos el siguiente plan:

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                                 HOJA DE RUTA                                     │
 │                                                                                  │
 │  [ FASE A ]  Refactor del Selector de Voto: Pizarra Digital Táctil (1 al 10)     │
 │  [ FASE B ]  Blindaje Concurrente de Envío y Verificación en Caliente             │
 │  [ FASE C ]  Unificación del Proyector y Métricas de Clasificación                │
 │  [ FASE D ]  Normalización de Rondas y Documentación Final                       │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

### 📋 Fase A: Pizarra Digital Táctil de Voto (1 al 10 con Medios Puntos) — ✅ [EN REVISIÓN EN /test-votar]
- [x] Eliminación total de emojis y palabras ambiguas (*🌱 Suave*, *👍 Bien*, etc.).
- [x] Construcción de botonera táctil numérica del `1` al `10` con escala térmica (rojo, ámbar, cian, lima neón).
- [x] Modificador de precisión `+½` (`+0.5`) para calificaciones intermedias (`7.5`, `8.5`, `9.5`).
- [x] Visor OLED con nota gigante en Oswald, barra de progreso y badges vectoriales SVG según el rango de calificación.
- [x] Rediseño completo con iconos vectoriales SVG para todos los estados (*Formulario*, *Voto Registrado*, *Escenario en Vivo*, *Sala Sellada*).
- [x] Simulador de laboratorio operativo en la ruta `/test-votar`.

### 📋 Fase B: Blindaje Concurrente y Validación de Poeta en Caliente — ✅ [COMPLETADA Y OPERATIVA]
- [x] **Bloqueo UI Inmediato:** Deshabilitación del botón y activación de spinner al pulsar para prevenir dobles clics y peticiones concurrentes.
- [x] **Validación de Votación Abierta:** Verificación en caliente con Supabase antes de insertar el voto.
- [x] **Validación Atómica de Poeta en Escena:** Comprobación de que el `participante_activo_id` en el servidor coincide exactamente con el poeta que el usuario tiene en pantalla (evitando votos accidentales si el presentador cambia de participante en ese instante).
- [x] **Inserción Protegida y Código 23505:** Inserción atómica en `votaciones` con captura de error de clave única PostgreSQL y registro en `localStorage`.
- [x] **Gestión de Errores de Conexión:** Banner visual con icono SVG y retención del valor seleccionado en caso de caída temporal de red.

### 📋 Fase C: Proyector y Clasificaciones (Medias Claras y Podio)
- [x] **Sub-fase C.1: Unificación de Métricas (Nota sobre 10 y Nº de Votos en lugar de %)** — ✅ [COMPLETADA]
  - [x] Sustituido el porcentaje `84.50%` por la nota media oficial del Slam (`8.45 / 10`) en tipografía Oswald.
  - [x] Añadido el volumen transparente de participación popular: `(64 votos del público)`.
- [x] **Sub-fase C.2: Rediseño del Podio Escénico (1º Laurel Dorado, 2º Pluma de Plata, 3º Lira de Bronce)** — ✅ [COMPLETADA]
  - [x] Eliminados todos los badges redundantes de texto para despejar la vista teatral.
  - [x] Pedestales en cristal ahumado (`rgba(12, 16, 22, 0.8)`) con haces láser superiores diferenciados (Oro, Plata, Bronce).
  - [x] Elevación y halo dorado distintivo para el 1º puesto con Corona de Laurel poética SVG.
- [x] **Sub-fase C.3: Rediseño de la Tabla de Clasificados (del 4º en adelante)** — ✅ [COMPLETADA]
  - [x] Tabla editorial de 2 columnas fluidas con espacio horizontal holgado (eliminado el truncado de nombres).
  - [x] Líneas láser milimétricas inferiores de nivel métrico.
- [x] **Sub-fase C.4: Pantalla de Revelación de Finalistas (Pase a la Gran Final)** — ✅ [COMPLETADA]
  - [x] Pantalla ceremonial de pase a la final con insignia de laurel, tarjetas con haz láser y animación staggered pop-in.
- [ ] **Sub-fase C.5: Pantalla de Standby y Proyección del QR (EN ESPERA)**

### 📋 Fase D: Normalización de Rondas en Live Control y BD
- Estandarizar la definición de rondas entre la interfaz de administración y las consultas SQL para que *La Quema* y las rondas clasificatorias/finales sean coherentes en todo el sistema.

---

<p align="center">
  <b>Poetry Slam Alicante © 2026</b><br>
  <i>Documento de Diagnóstico y Plan Maestro de Votaciones.</i>
</p>

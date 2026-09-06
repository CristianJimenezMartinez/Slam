# 🗳️ ANÁLISIS EXHAUSTIVO Y QUIRÚRGICO DEL SISTEMA DE VOTACIÓN
## POETRY SLAM ALICANTE — ARQUITECTURA, FLUJO Y MECÁNICAS DE VOTO

> **Documento Técnico de Referencia Absoluta**  
> Este documento describe con precisión milimétrica el funcionamiento actual del sistema de votaciones, tokens de dispositivo, base de datos, sincronización en tiempo real, estados de pantalla y proyección de notas.

---

## 📑 ÍNDICE DE CONTENIDOS

1. [Visión General del Sistema de Votación](#1-visión-general-del-sistema-de-votación)
2. [Identidad del Votante y Ciclo de Vida del Token (`voter_token`)](#2-identidad-del-votante-y-ciclo-de-vida-del-token-voter_token)
   - [2.1 Modo A: Credencial QR Físico Pre-Impreso](#21-modo-a-credencial-qr-físico-pre-impreso)
   - [2.2 Modo B: QR Abierto en Pantalla (Acceso Dinámico)](#22-modo-b-qr-abierto-en-pantalla-acceso-dinámico)
   - [2.3 Modo C: Sellado de Sala (PIN Bloqueado)](#23-modo-c-sellado-de-sala-pin-bloqueado)
   - [2.4 Persistencia y Resiliencia en LocalStorage](#24-persistencia-y-resiliencia-en-localstorage)
3. [Base de Datos: Tablas, Vistas y Restricciones](#3-base-de-datos-tablas-vistas-y-restricciones)
   - [3.1 Tabla `votaciones`](#31-tabla-votaciones)
   - [3.2 Tabla `eventos` (Banderas de Control)](#32-tabla-eventos-banderas-de-control)
   - [3.3 Tabla `participantes`](#33-tabla-participantes)
   - [3.4 Vista / Tabla `resultados`](#34-vista--tabla-resultados)
4. [Control de Votaciones desde el Panel de Administración (`LiveControlComponent`)](#4-control-de-votaciones-desde-el-panel-de-administración-livecontrolcomponent)
   - [4.1 Activación 1 a 1 de Poetas](#41-activación-1-a-1-de-poetas)
   - [4.2 Apertura y Cierre de Votación](#42-apertura-y-cierre-de-votación)
   - [4.3 Gestión de Rondas (`rondaActual`)](#43-gestión-de-rondas-rondaactual)
5. [Experiencia del Votante (`/votar`): Máquina de 5 Estados](#5-experiencia-del-votante-votar-máquina-de-5-estados)
   - [5.1 Estado 1: Acceso Bloqueado (`app-votar-lock`)](#51-estado-1-acceso-bloqueado-app-votar-lock)
   - [5.2 Estado 2: Evento Sin Votación Activa (`app-votar-standby`)](#52-estado-2-evento-sin-votación-activa-app-votar-standby)
   - [5.3 Estado 3: Esperando al Siguiente Poeta (`app-votar-standby`)](#53-estado-3-esperando-al-siguiente-poeta-app-votar-standby)
   - [5.4 Estado 4: Formulario de Votación Activo (`app-votar-form`)](#54-estado-4-formulario-de-votación-activo-app-votar-form)
   - [5.5 Estado 5: Voto Emitido y Bloqueo (`app-votar-success`)](#55-estado-5-voto-emitido-y-bloqueo-app-votar-success)
6. [Mecánica de Sincronización Realtime (WebSockets)](#6-mecánica-de-sincronización-realtime-websockets)
7. [Cálculo de Notas y Modo Proyector (`PuntuacionesComponent`)](#7-cálculo-de-notas-y-modo-proyector-puntuacionescomponent)
8. [Análisis Crítico: Inconsistencias y Puntos de Fricción Actuales](#8-análisis-crítico-inconsistencias-y-puntos-de-fricción-actuales)

---

## 1. VISIÓN GENERAL DEL SISTEMA DE VOTACIÓN

El sistema de votación permite que el público presente en la sala califique las actuaciones de los poetas en tiempo real desde sus propios teléfonos móviles.

### Premisas Fundamentales:
- **Sin registro ni contraseñas para el público:** El usuario no crea cuenta; accede mediante token efímero vinculado a su dispositivo.
- **Acceso acotado a la sala:** Solo quienes escanean el QR durante la ventana de registro pueden votar.
- **Unicidad de Voto:** Un dispositivo solo puede emitir un único voto por poeta y por ronda.
- **Sincronización Instantánea:** En cuanto el administrador activa al siguiente poeta en el panel, las pantallas de todos los móviles en la sala cambian inmediatamente al formulario de ese participante.

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                                   SALA DEL SLAM                                  │
 │                                                                                  │
 │   1. QR en Proyector          2. Móvil Público (/votar)     3. Panel Admin Live  │
 │   ┌─────────────────┐         ┌───────────────────────┐     ┌──────────────────┐ │
 │   │  [ QR EVENTO ]  │ ──Scan─►│ Guarda 'voter_token'  │     │ Activa Poeta X   │ │
 │   │  access_code=id │         │ Estado: Standby       │◄─WSS│ Abre Votación    │ │
 │   └─────────────────┘         └───────────┬───────────┘     └──────────────────┘ │
 │                                           │ (HTTP POST)                          │
 │                                           ▼                                      │
 │                               ┌───────────────────────┐                          │
 │                               │ Supabase 'votaciones' │                          │
 │                               │ (puntuacion, token)   │                          │
 │                               └───────────┬───────────┘                          │
 │                                           │ (WSS Realtime)                       │
 │                                           ▼                                      │
 │                               ┌───────────────────────┐                          │
 │                               │ Proyector /puntuaciones│                         │
 │                               │ Media calculada en vivo│                         │
 │                               └───────────────────────┘                          │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. IDENTIDAD DEL VOTANTE Y CICLO DE VIDA DEL TOKEN (`voter_token`)

El sistema identifica a cada votante de forma anónima mediante un string alfanumérico denominado **`voter_token`**.

### 2.1 Modo A: Credencial QR Físico Pre-Impreso
- **Generación:** En `/admin/imprimir-qrs/:eventoId`, la organización genera tarjetas físicas con URLs del tipo:  
  `https://poetryslamalicante.com/votar?credencial=UUID_CREDENCIAL`
- **Activación en Cliente (`votar.component.ts`):**
  1. Si `credencial` viene en los query params, el cliente genera un token local si no existía:
     ```typescript
     token = Math.random().toString(36).substring(2) + Date.now().toString(36);
     ```
  2. Llama a la función RPC de Supabase:
     ```typescript
     await this.credencialesService.activarCredencial(credencialId, token);
     ```
  3. Si la base de datos valida la credencial (no usada previamente por otro token), guarda en `localStorage`:
     ```typescript
     localStorage.setItem(`voter_token_${evento.id}`, token);
     ```
  4. Limpia la URL eliminando `?credencial=` para evitar reutilizaciones accidentales.

### 2.2 Modo B: QR Abierto en Pantalla (Acceso Dinámico)
- **Generación:** En `/qr` o `/proyector`, se proyecta la URL:  
  `https://poetryslamalicante.com/votar?access_code=UUID_EVENTO`
- **Validación en Cliente (`votar.component.ts`):**
  1. Si `access_code === evento.id`:
     - **Si `evento.registro_pin_abierto === true`:**
       Se genera un nuevo `voter_token` aleatorio y se almacena en `localStorage.setItem('voter_token_' + evento.id, token)`.
       Se limpia `?access_code` de la barra de direcciones.
     - **Si `evento.registro_pin_abierto === false`:**
       Se rechaza el acceso estableciendo `accesoBloqueado = true`.

### 2.3 Modo C: Sellado de Sala (PIN Bloqueado)
- Una vez comenzado el evento, el administrador conmuta el botón **`📱 QR: Registro Abierto / Bloqueado`** en el panel (`live-control`).
- Al cerrarse (`registro_pin_abierto: false`), **nadie nuevo puede entrar a votar**, aunque tengan el enlace o la foto del QR.
- Los usuarios que ya tenían su `voter_token` en `localStorage` **continúan votando con normalidad** durante toda la noche.

### 2.4 Persistencia y Resiliencia en LocalStorage
El cliente gestiona dos claves en `localStorage`:
1. `voter_token_${evento.id}`: String del token del dispositivo (UUID/Hash efímero).
2. `votos_${evento.id}_r${ronda}`: Array JSON con los IDs de los poetas a los que este dispositivo ya ha votado en la ronda actual:
   ```json
   ["b74f3586-1d12-4c22-990a-11a2f4581234", "9c123456-7890-4aef-bcde-9876543210ab"]
   ```

---

## 3. BASE DE DATOS: TABLAS, VISTAS Y RESTRICCIONES

### 3.1 Tabla `votaciones`
Es la tabla transaccional donde se registran los votos individuales:

```sql
CREATE TABLE votaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  participante_id uuid NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  puntuacion numeric(4,2) NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 10),
  voter_token text NOT NULL,
  ronda integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Restricción de Unicidad Crítica:
  CONSTRAINT unq_voto_participante_dispositivo UNIQUE (participante_id, voter_token, ronda)
);
```

> **Código de Error PostgreSQL 23505 (Unique Violation):**  
> Si un usuario intenta enviar un voto duplicado (por ejemplo, enviando peticiones paralelas o manipulando el cliente), la base de datos rechaza la inserción con error `23505`. El cliente captura este código y marca inmediatamente al poeta como votado en `localStorage`.

### 3.2 Tabla `eventos` (Banderas de Control en Tiempo Real)
Controla el estado global de la competición:

| Campo | Tipo | Función en el Sistema de Votación |
| :--- | :--- | :--- |
| `id` | `uuid` | Identificador único del Slam. |
| `activo` | `boolean` | Determina si es el evento que se carga en la home y en `/votar`. |
| `votacion_activa` | `boolean` | **Master Switch de Votación:** `true` permite votar; `false` bloquea la pantalla de todos los móviles. |
| `participante_activo_id` | `uuid` | **Poeta en Escena:** ID del poeta que está recitando. Provoca el cambio de formulario en todos los dispositivos. |
| `puntuaciones_activas` | `boolean` | Publica u oculta las notas en el `/proyector`. |
| `registro_pin_abierto` | `boolean` | Abre o cierra la ventana para que nuevos votantes obtengan `voter_token`. |
| `ronda_activa` | `integer` | Ronda actual (`1`: Demostración/Quema, `2`: Clasificatoria, `3`: Gran Final). |
| `limite_finalistas` | `integer` | Número de poetas que pasan a la final (por defecto 3). |

### 3.3 Tabla `participantes`
Contiene a los poetas inscritos en el evento:
- `id`: UUID.
- `evento_id`: UUID del evento.
- `nombre`: Nombre artístico.
- `foto_url`: Imagen de avatar.
- `orden`: Posición de recitado (determinado por sorteo en la ruleta). `orden = 0` es reservado para el poeta de *La Quema* (demostración).
- `ronda`: `1` (Clasificatoria) o `2` (Final).
- `puntuacion_final`: Nota final consolidada tras penalizaciones.

### 3.4 Vista / Tabla `resultados`
Vista SQL agregada que calcula las clasificaciones en vivo:
```sql
SELECT 
  v.participante_id,
  p.nombre AS participante,
  p.foto_url,
  p.orden,
  v.evento_id,
  e.nombre AS evento,
  COUNT(v.id) AS num_votos,
  SUM(v.puntuacion) AS puntuacion_total,
  ROUND(AVG(v.puntuacion), 2) AS puntuacion_media,
  v.ronda,
  RANK() OVER (PARTITION BY v.evento_id, v.ronda ORDER BY AVG(v.puntuacion) DESC) AS posicion
FROM votaciones v
JOIN participantes p ON p.id = v.participante_id
JOIN eventos e ON e.id = v.evento_id
GROUP BY v.participante_id, p.nombre, p.foto_url, p.orden, v.evento_id, e.nombre, v.ronda;
```

---

## 4. CONTROL DE VOTACIONES DESDE EL PANEL DE ADMINISTRACIÓN (`LiveControlComponent`)

El componente `LiveControlComponent` (`src/app/features/admin/event-detail/components/live-control/`) es la consola técnica del presentador.

### 4.1 Activación 1 a 1 de Poetas
- El listado muestra a todos los poetas de la ronda activa.
- Al pulsar **`Abrir Votación`** junto al nombre de un poeta:
  1. Se ejecuta `abrirVotacion(participanteId)`.
  2. Se actualiza el evento en Supabase:
     ```typescript
     await this.eventosService.updateEvento(this.evento.id, {
       participante_activo_id: participanteId,
       votacion_activa: true
     });
     ```
  3. Esto dispara un evento WebSocket en Supabase Realtime hacia todos los móviles conectados.

### 4.2 Apertura y Cierre de Votación
- **`🚫 Cerrar Votos`:** Establece `participante_activo_id = null` o `votacion_activa = false`. Las pantallas de los móviles pasan instantáneamente al estado de espera (*"Esperando al siguiente poeta..."*).
- **`📊 Publicar / Ocultar Puntuaciones`:** Modifica `puntuaciones_activas: boolean`. Activa o desactiva la vista de resultados en el proyector de sala.

### 4.3 Gestión de Rondas (`rondaActual`)
- **Ronda 1 (`La Quema`):** Poeta de prueba (`orden === 0`). Sirve para que el público aprenda a votar y compruebe su conexión.
- **Ronda 2 (`Clasificatoria`):** Compiten todos los participantes del cartel.
- **Ronda 3 (`Gran Final`):** Solo compiten los finalistas clasificados (calculados por el top de puntuaciones de la ronda clasificatoria).

---

## 5. EXPERIENCIA DEL VOTANTE (`/votar`): MÁQUINA DE 5 ESTADOS

El componente `VotarComponent` (`src/app/features/votar/`) implementa una máquina de estados reactiva estricta:

```
                  ┌────────────────────────┐
                  │    INICIO / CARGA      │
                  └───────────┬────────────┘
                              │
               ¿Tiene token válido en Storage?
                     /                \
                   NO                  SÍ
                   /                    \
     ┌──────────────────────┐   ┌───────────────────────────┐
     │ 1. ACCESO BLOQUEADO  │   │ ¿evento.votacion_activa?  │
     │  (app-votar-lock)    │   └─────────────┬─────────────┘
     └──────────────────────┘                 │
                                       /             \
                                     NO               SÍ
                                     /                 \
                       ┌──────────────────────┐  ┌───────────────────────────┐
                       │ 2. SIN VOTO ACTIVO   │  │ ¿participante_activo_id?  │
                       │  (app-votar-standby) │  └─────────────┬─────────────┘
                       └──────────────────────┘                │
                                                        /             \
                                                      NO               SÍ
                                                      /                 \
                                        ┌──────────────────────┐  ┌───────────────────────────┐
                                        │ 3. ESPERA A POETA    │  │ ¿Ya votó a este poeta?    │
                                        │  (app-votar-standby) │  └─────────────┬─────────────┘
                                        └──────────────────────┘                │
                                                                         /             \
                                                                       NO               SÍ
                                                                       /                 \
                                                         ┌──────────────────────┐  ┌───────────────────────────┐
                                                         │ 4. FORMULARIO VOTO   │  │ 5. VOTO REGISTRADO        │
                                                         │  (app-votar-form)    │  │  (app-votar-success)      │
                                                         └──────────────────────┘  └───────────────────────────┘
```

### 5.1 Estado 1: Acceso Bloqueado (`app-votar-lock`)
- **Condición:** No existe `voter_token` en `localStorage` y la sala está cerrada (`registro_pin_abierto = false`) o el `access_code` no coincide.
- **Vista:** Mensaje advirtiendo que el acceso a la votación requiere escaneo presencial del código QR del evento.

### 5.2 Estado 2: Evento Sin Votación Activa (`app-votar-standby`)
- **Condición:** El usuario tiene token, pero `evento.votacion_activa === false`.
- **Vista:** Pantalla de espera indicando que el encuentro aún no ha comenzado o se encuentra en pausa.

### 5.3 Estado 3: Esperando al Siguiente Poeta (`app-votar-standby`)
- **Condición:** `evento.votacion_activa === true`, pero `evento.participante_activo_id === null`.
- **Vista:** *"Esperando al siguiente poeta..."*, con animación de carga y citas poéticas.

### 5.4 Estado 4: Formulario de Votación Activo (`app-votar-form`)
- **Condición:** `evento.votacion_activa === true`, `evento.participante_activo_id` definido y `yaVotadoAlPoetaActivo === false`.
- **Vista:**
  - Avatar grande y nombre del poeta en escena.
  - Selector de puntuación táctil con 5 pastillas gamificadas:
    - `2` — *🌱 Suave (20%)*
    - `4` — *👍 Bien (40%)*
    - `6` — *⚡ Fuerte (60%)*
    - `8` — *🔥 Fuego (80%)*
    - `10` — *✨ Magia (100%)*
  - Botón gigante: **`¡Enviar mi Voto!`**.

### 5.5 Estado 5: Voto Emitido y Bloqueo (`app-votar-success`)
- **Condición:** El usuario acaba de enviar su voto o ya existía el registro en `localStorage` para este poeta y ronda.
- **Vista:**
  - Mensaje de confirmación: *"¡Voto registrado para [Nombre del Poeta]!"*.
  - Bloqueo total del formulario (no se puede rectificar).
  - En cuanto el administrador active a otro poeta en Supabase, el listener Realtime detecta el nuevo ID, limpia la selección y vuelve al **Estado 4** para el siguiente participante.

---

## 6. MECÁNICA DE SINCRONIZACIÓN REALTIME (WEBSOCKETS)

La sincronización entre el panel de administración, los móviles del público y el proyector funciona mediante **Supabase Realtime Channels** sobre WebSockets:

```typescript
// src/app/core/services/eventos.service.ts
listenToEventoChanges(eventoId: string, callback: (payload: any) => void) {
  return this.supa.client
    .channel(`evento-changes-${eventoId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'eventos',
        filter: `id=eq.${eventoId}`
      },
      callback
    )
    .subscribe();
}
```

### Eventos que provocan cambios inmediatos en el cliente:
1. `participante_activo_id`: Hace que todos los clientes cambien de poeta en pantalla.
2. `votacion_activa`: Abre o cierra los formularios de votación a la vez.
3. `puntuaciones_activas`: Muestra u oculta la pantalla de resultados en el proyector.
4. `ronda_activa`: Conmuta las rondas y actualiza los cálculos de finalistas.

---

## 7. CÁLCULO DE NOTAS Y MODO PROYECTOR (`PuntuacionesComponent`)

En `/puntuaciones` (o `/proyector`):
- Se consulta la vista `resultados` filtrada por `evento_id` y `rondaActual`.
- Se ordenan los participantes por `posicion` (de mayor a menor nota media).
- **Cálculo de Finalistas (`cargarFinalistas()`):**
  - Consulta los resultados de la Ronda 2 (Clasificatoria).
  - Obtiene la nota de corte según `limite_finalistas` (por defecto 3 poetas).
  - Incluye automáticamente a todos los poetas que empaten en la nota de corte para evitar exclusiones injustas.

---

## 8. ANÁLISIS CRÍTICO: INCONSISTENCIAS Y PUNTOS DE FRICCIÓN ACTUALES

A continuación se detallan las inconsistencias y limitaciones detectadas en la dinámica actual de votación que motivan su futura refactorización:

### ⚠️ 1. Gamificación Rígida de Puntuaciones (Solo 5 Opciones Pares)
- **Problema:** El formulario de voto solo ofrece 5 botones: `2, 4, 6, 8, 10` (*Suave, Bien, Fuerte, Fuego, Magia*).
- **Inconsistencia:** En el formato oficial de Poetry Slam, las puntuaciones se otorgan de 1 a 10 (incluyendo números impares `1, 3, 5, 7, 9` e incluso decimales `8.5`, `9.2`). Limitar a solo 5 valores pares desvirtúa la precisión del jurado popular y genera empates masivos artificiales.

### ⚠️ 2. Inconsistencia en la Numeración de Rondas
- **Problema:** 
  - En `LiveControlComponent`:
    - `rondaActual = 1` corresponde a *La Quema* (Demostración).
    - `rondaActual = 2` corresponde a *Clasificatoria*.
    - `rondaActual = 3` corresponde a *Gran Final*.
  - En `PuntuacionesComponent` y `participantes.ronda`:
    - La tabla `participantes` solo maneja `ronda = 1` y `ronda = 2`.
    - `puntuaciones.component.ts` tiene que hacer un parche donde `rondaActual === 3` consulta los resultados con `ronda = 2`.
- **Riesgo:** Confusión en las consultas SQL y agregaciones si no se unifica si *La Quema* es ronda 0 o ronda 1.

### ⚠️ 3. Sistema Olímpico de Descarte (Pendiente de Lógica Oficial)
- **Problema:** En el Poetry Slam estándar, cuando hay 5 pizarras, se descarta la nota más alta y la más baja, sumando las 3 intermedias.
- **Situación actual:** La vista SQL hace un simple `AVG(puntuacion)` (media aritmética de todos los votos emitidos). Si un solo usuario emite un 2 o un 10 por error o sesgo, distorsiona la media sin un filtro de descarte de extremos o mediana.

### ⚠️ 4. Dependencia de LocalStorage para Control de Doble Voto
- **Problema:** Si un usuario borra la caché o entra en modo incógnito, su `localStorage` se vacía, permitiéndole obtener un nuevo `voter_token` si el PIN de registro sigue abierto.
- **Mitigación actual:** El "Sellado de Sala" (`registro_pin_abierto: false`) previene que se generen nuevos tokens una vez iniciado el evento, pero requiere que el administrador se acuerde siempre de cerrar el PIN antes del primer recitado.

---

<p align="center">
  <b>Poetry Slam Alicante © 2026</b><br>
  <i>Documento de Especificación Técnica de Votaciones.</i>
</p>

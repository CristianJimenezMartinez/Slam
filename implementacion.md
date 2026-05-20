# Plan Maestro de Implementación: Poetry Slam Alicante (Roadmap Final)

Este documento es la única fuente de verdad para el desarrollo. Unifica todas las conversaciones previas sobre seguridad, validación secuencial y rediseño del panel administrativo.

---

## Fase 1: Infraestructura y Base de Datos
Antes de construir la interfaz, debemos asegurar que el motor (Supabase) soporte la lógica.
- [x] **Tabla `eventos`**: Campos `registro_pin_abierto` (Boolean) y `votos_totales_registrados` (Integer) ya operativos.
- [x] **Tabla `participantes`**: Campo `esta_votando` (Boolean) para identificar quién está en escena.
- [x] **Servicio de Votaciones**: Método `submitVotaciones` con control de `voter_token`.

---

## Fase 2: Seguridad y Selección de Poetas (Uno a Uno)

### 2.1 Sistema de Validación por Acceso Único (Sellado)
La seguridad se basa en la validación del dispositivo vinculada al evento:
- [x] **Acceso por UUID**: El `id` del evento actúa como llave única en la URL (`access_code`).
- [x] **Ventana de Validación (SELLADO)**: 
    - El Admin usa `registro_pin_abierto` para permitir o bloquear la entrada de nuevos dispositivos.
    - Una vez cerrado, nadie sin un token previo puede entrar, aunque tenga el link.
- [x] **Persistencia**: El `voter_token` se guarda en `localStorage`, permitiendo votar durante todo el evento sin revalidar.
- [ ] **Contador de Dispositivos**: (Pendiente) Visualización en tiempo real de cuántos dispositivos han validado su token.

### 2.2 Estado del Participante y Votación
- [x] **Gestión 1 a 1 de Poeta Activo**: Implementado de forma robusta en la base de datos y la interfaz mediante el campo `evento.participante_activo_id`. Solo un poeta puede estar en escena en cada momento, actuando como la única fuente de verdad y asegurando la unicidad.

---

## Fase 3: Rediseño y Unificación del Panel Admin (Dashboard)

### 3.1 Interfaz de Pestañas (Tabs)
- [x] **Navegación Superior**: Un diseño de navegación moderno con pestañas para alternar de forma fluida entre:
    - **Control Live** (Gestión del PIN de registro, activación de poetas, control de rondas y visualización).
    - **Eventos** (Slams activos y programados con acciones de edición rápida).
    - **Anteriores** (Historial de Slams pasados).
    - **Temporada** (Visualización y edición de la cartelera y cronograma global).

### 3.2 Arquitectura de Modales Reutilizables
- [x] **Modales independientes**: Implementado. El formulario de creación/edición de eventos (`app-event-detail`) se encapsula dentro del componente reutilizable `<app-modal>`, aislando por completo la lógica para un mantenimiento más limpio.

### 3.3 Aislamiento de Roles
- [x] **Separación de Vistas**: Implementado. El diseño técnico y la lógica de negocio separan el panel administrativo con cabeceras (`app-admin-header`), pestañas (`app-admin-tabs`) e inicio de sesión seguro, de la experiencia directa del usuario.

---

## Fase 4: Experiencia del Público (Página /votar)
Rediseñar la ruta `/votar` para que sea dinámica y reaccione al Admin:

- [x] **Estado 1: Acceso Bloqueado**: Si el dispositivo no tiene token y el registro está cerrado, muestra mensaje de "Acceso por invitación/QR".
- [x] **Estado 2: Cerrado**: Mensaje indicando que aún no han comenzado las votaciones del evento.
- [x] **Estado 3: Espera**: Pantalla de "Esperando al siguiente poeta..." con animaciones fluidas.
- [x] **Estado 4: Formulario de Voto**:
    - Muestra Foto y Nombre del poeta activo.
    - Selector de puntos (1-10).
    - Botón "Enviar Voto".
- [x] **Estado 5: Voto Registrado**: Tras votar, se muestra la confirmación (`app-votar-success`) y el formulario queda bloqueado de forma no rectificable. En cuanto el Admin activa un nuevo poeta, el cliente detecta el cambio de ID en tiempo real, limpia el estado y vuelve a mostrar el formulario de voto para el nuevo participante de forma automática.

---

## Fase 5: Sincronización Realtime
- [x] **Supabase Realtime**: Implementado con éxito. Se suscriben los componentes a los canales de Supabase (`listenToEventoChanges`, `listenToAllEventosChanges`) permitiendo actualizaciones instantáneas del estado del Slam (poeta activo, publicación de puntuaciones, cierre de ronda) en la vista del público sin necesidad de recargar la página.

---

## Próximos Pasos sugeridos
1.  **Aprobación** de este documento definitivo.
2.  Desarrollo del **Contenedor Principal** del Dashboard con las pestañas.
3.  Migración del formulario de Eventos a su primera **Modal**.
4.  Implementación de la lógica **"Control Live"** (PIN + Uno a Uno).

> [!CAUTION]
> Es crítico asegurar que el `voter_token` sea robusto para evitar que refrescar la página permita votar dos veces al mismo poeta.

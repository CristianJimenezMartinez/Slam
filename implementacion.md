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
- **Acceso por UUID**: El `id` del evento actúa como llave única en la URL (`access_code`).
- **Ventana de Validación (SELLADO)**: 
    - El Admin usa `registro_pin_abierto` para permitir o bloquear la entrada de nuevos dispositivos.
    - Una vez cerrado, nadie sin un token previo puede entrar, aunque tenga el link.
- **Persistencia**: El `voter_token` se guarda en `localStorage`, permitiendo votar durante todo el evento sin revalidar.
- **Contador de Dispositivos**: (Pendiente) Visualización en tiempo real de cuántos dispositivos han validado su token.

### 2.2 Estado del Participante y Votación
- **Campo `esta_votando`**: Para identificar quién está en escena.
- **Unicidad**: Control para que solo un poeta pueda tener el voto abierto simultáneamente (al activar uno, se desactivan los demás).

---

## Fase 3: Rediseño y Unificación del Panel Admin (Dashboard)

### 3.1 Interfaz de Pestañas (Tabs)
Un diseño ancho de tarjetas moderno con navegación superior para alternar entre:
- **Control Live**: (Gestión del PIN, Sellado, Contador y Votación 1 a 1).
- **Eventos**: Listado de todos los slams y acciones rápidas.
- **Temporada**: Configuración global, cartelera y cronograma masivo.
- **Usuarios**: (Futuro) Gestión delegada de permisos y roles.

### 3.2 Arquitectura de Modales Reutilizables
- Los formularios de (Crear/Editar Evento) y (Configuración de Temporada) se transformarán en **Modales independientes**.
- Esto evita que el código sature el componente principal y facilita el mantenimiento por ramas separadas.

### 3.3 Aislamiento de Roles
- Diseño técnico para que el flujo de "Admin" esté separado de futuros flujos de "Usuario de aplicación".

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
- [ ] **Estado 5: Voto Registrado**: El formulario desaparece y se bloquea (no rectificable). Muestra confirmación y vuelve a estado de espera automáticamente para el siguiente poeta.

---

## Fase 5: Sincronización Realtime
- [ ] **Supabase Realtime**: Implementar suscripciones para que el cambio de estado en el Dashboard (Admin) se refleje instantáneamente en los dispositivos del público sin necesidad de recargar la página.

---

## Próximos Pasos sugeridos
1.  **Aprobación** de este documento definitivo.
2.  Desarrollo del **Contenedor Principal** del Dashboard con las pestañas.
3.  Migración del formulario de Eventos a su primera **Modal**.
4.  Implementación de la lógica **"Control Live"** (PIN + Uno a Uno).

> [!CAUTION]
> Es crítico asegurar que el `voter_token` sea robusto para evitar que refrescar la página permita votar dos veces al mismo poeta.

# Plan Maestro de Implementación: Poetry Slam Alicante (Roadmap Final)

Este documento es la única fuente de verdad para el desarrollo. Unifica todas las conversaciones previas sobre seguridad, validación secuencial y rediseño del panel administrativo.

---

## Fase 1: Infraestructura y Base de Datos
Antes de construir la interfaz, debemos asegurar que el motor (Supabase) soporte la lógica.
- [ ] **Tabla `eventos`**: Añadir campos `pin_sesion` (String), `registro_pin_abierto` (Boolean) y `votos_totales_registrados` (Integer).
- [ ] **Tabla `participantes`**: Añadir campo `esta_votando` (Boolean) para identificar quién está en escena.
- [ ] **Servicio de Votaciones**: Implementar método `verificarVotoUnico(token, poetaId)` para evitar votos duplicados al mismo poeta.

---

## Fase 2: Seguridad y Selección de Poetas (Uno a Uno)

### 2.1 Sistema de Validación por PIN (Acceso Controlado)
Para asegurar que solo el público presente pueda votar, implementaremos un sistema de "Puerta de Entrada":
- **PIN de Sesión**: Un código de 4 dígitos generado por el Admin.
- **Ventana de Validación (SELLADO)**: 
    - El Admin puede **Abrir/Cerrar la entrada del PIN**.
    - Pasados los primeros minutos del evento, el Admin "Sella" el acceso. 
    - Aunque alguien comparta el PIN por fuera, si el Admin ha cerrado la entrada, ningún nuevo dispositivo podrá validarse.
- **Persistencia**: Los que ya validaron su PIN mientras el acceso estaba abierto, mantienen su permiso para votar toda la noche sin problemas.
- **Contador de Dispositivos**: Visualización en tiempo real en el Dashboard de cuántos dispositivos han sido validados con éxito.

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

- [ ] **Estado 1: Acceso PIN**: Si el dispositivo no está validado, pide el código de sesión (solo si el registro está abierto).
- [ ] **Estado 2: Cerrado**: Mensaje indicando que aún no han comenzado las votaciones del evento.
- [ ] **Estado 3: Espera**: Pantalla de "Esperando al siguiente poeta..." con animaciones fluidas.
- [ ] **Estado 4: Formulario de Voto**:
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

# Registro Maestro de Implementación: Poetry Slam Alicante

Este documento registra el estado técnico de implementación y arquitectura del proyecto. Todas las fases de infraestructura, seguridad, panel de administración, experiencia del público y sincronización en tiempo real se encuentran **100% completadas y operativas**.

---

## ✅ Fase 1: Infraestructura y Base de Datos (Completada)
- [x] **Tabla `eventos`**: Campos `registro_pin_abierto` (Boolean), `votos_totales_registrados` (Integer), `participante_activo_id` (UUID), banderas de votación y publicación de notas.
- [x] **Tabla `participantes`**: Asignación a eventos, orden de recitado, foto de perfil y ronda.
- [x] **Tabla `votos`**: Registro de votos con restricción de unicidad `(participante_id, voter_token)`.
- [x] **Servicio de Votaciones**: Emisión protegida con validación de `voter_token`.

---

## ✅ Fase 2: Seguridad y Selección de Poetas (Completada)
- [x] **Acceso por UUID**: El `id` del evento actúa como llave única en la URL (`access_code`).
- [x] **Ventana de Validación (Sellado de Sala)**: El organizador controla `registro_pin_abierto` para habilitar o cerrar la entrada de nuevos dispositivos.
- [x] **Persistencia de Token**: El `voter_token` se almacena en `localStorage`, permitiendo votar de forma ininterrumpida durante toda la velada sin necesidad de revalidar.
- [x] **Gestión 1 a 1 de Poeta Activo**: Control centralizado mediante `evento.participante_activo_id`. Solo un poeta puede estar activo en cada instante, sincronizándose reactivamente en toda la sala.

---

## ✅ Fase 3: Panel de Administración y Control Rápido (Completada)
- [x] **Navegación por Pestañas**: Pestañas de alto rendimiento con tipografía Barlow Condensed e iconos vectoriales (*Slam Live, Eventos Próximos, Historial, Temporada & Marca*).
- [x] **Sub-Barra de Control Rápido (`admin-quick-bar`)**: Barra persistente bajo la cabecera para saltar al instante entre Panel, Proyector, Cronómetro, Ruleta, Puntuaciones y QRs.
- [x] **Menú de Perfil Desplegable**: Avatar oficial de la pluma poética (`avatar-quill.jpg`) con dropdown flotante glassmorphism para gestión de accesos y cierre de sesión.
- [x] **Arquitectura de Modales**: Formulario de creación y edición (`app-event-detail`) totalmente desacoplado mediante `<app-modal>`.
- [x] **Gestor de Temporada por Lotes**: Carga de imagen de fondo, selector de paleta de colores y lote de fechas.

---

## ✅ Fase 4: Experiencia del Público (`/votar`) (Completada)
- [x] **Estado 1: Acceso Bloqueado**: Si el dispositivo no tiene token y el registro está cerrado.
- [x] **Estado 2: Sin Votación Activa**: Mensaje de espera antes del inicio del evento.
- [x] **Estado 3: En Espera**: Pantalla reactiva entre actuaciones.
- [x] **Estado 4: Formulario de Voto**: Foto y nombre del poeta activo, teclado táctil 1-10 y confirmación.
- [x] **Estado 5: Voto Registrado**: Confirmación inmediata y reseteo automático en cuanto el administrador activa al siguiente participante.

---

## ✅ Fase 5: Sincronización Realtime y Herramientas de Escenario (Completada)
- [x] **Supabase Realtime**: Suscripciones `postgres_changes` en `listenToEventoChanges()` para cambios de notas, poeta activo y banderas de estado sin recarga.
- [x] **Cronómetro Oficial (`/cronometro`)**: Tiempo reglamentario de 3:00 min, penalización automática (-0.5 pts cada 10s), aviso de descalificación (3:30 min), Web Audio API y atajos de teclado.
- [x] **Ruleta de Sorteo (`/ruleta`)**: Canvas 2D interactivo con física de desaceleración realista, sintetizador de audio y lluvia de confetti.
- [x] **Proyector de Sala (`/proyector` / `/puntuaciones`)**: Pantalla de alta visibilidad para sala con clasificación en directo y podio.
- [x] **Impresión de Tarjetas QR (`/admin/imprimir-qrs`)**: Generador de tarjetas A4 con tokens de votación únicos listos para imprimir.

---

> ℹ️ **Para la documentación técnica completa del proyecto y el desglose de componentes, consulta el archivo [README.md](README.md).**


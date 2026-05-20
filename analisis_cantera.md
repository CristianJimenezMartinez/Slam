# Análisis Técnico y Funcional de la Sección "Cantera"
Este documento contiene una radiografía completa de la sección **Cantera** dentro del proyecto **Poetry Slam Alicante**. Está diseñado específicamente como contexto de entrada para que **Claude Opus** pueda realizar refactorizaciones, mejoras estéticas avanzadas e integraciones de base de datos de manera inmediata.

---

## 1. Contexto del Proyecto y Rol de "Cantera"
**Poetry Slam Alicante** es una plataforma web híbrida (Angular + Supabase) para gestionar eventos de poesía en vivo, registro de participantes, votaciones en tiempo real para el público y visualización de resultados.

Dentro de este ecosistema, la **Cantera** es el espacio dedicado a los jóvenes y nuevos talentos emergentes del Poetry Slam. Actualmente, funciona como una sección informativa/landing y punto de captación (CTA) de nuevos poetas, pero está preparada para evolucionar hacia un módulo dinámico e interactivo.

---

## 2. Radiografía de Archivos Actuales

La sección de la Cantera está modularizada dentro del módulo de landing de la aplicación Angular:

### A. Lógica de Componente: `cantera.component.ts`
* **Ruta:** `d:\Slam\slam\src\app\features\landing\cantera\cantera.component.ts`
* **Estado actual:** Boilerplate puro, sin estado ni lógica de negocio activa.
* **Código:**
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-cantera',
  templateUrl: './cantera.component.html',
  styleUrls: ['./cantera.component.scss']
})
export class CanteraComponent { }
```

### B. Estructura HTML: `cantera.component.html`
* **Ruta:** `d:\Slam\slam\src\app\features\landing\cantera\cantera.component.html`
* **Diseño actual:** Estructura de scroll único vertical unificado con fondo inmersivo.
* **Componentes principales:**
  1. Fondo fijo con imagen `cantera_hero.png` con desenfoque (`hero-bg-container`) y un degradado oscuro (`hero-overlay`) que conecta sin divisiones con el color de fondo global.
  2. Cabecera Hero (`hero-header`) con tipografía de alto impacto `Bebas Neue` y efecto de brillo de texto (`glow-text`).
  3. Tarjeta de acción tipo Glassmorphic (`cta-section glass`) que invita a los usuarios a contactar para participar, redirigiendo a la landing principal.
* **Código:**
```html
<div class="cantera-wrapper">
  
  <!-- BACKGROUND FIJO PARA TODA LA PÁGINA -->
  <div class="hero-bg-container">
    <img src="/assets/images/cantera_hero.png" alt="Cantera Hero" class="hero-img">
  </div>
  <div class="hero-overlay"></div>

  <!-- CONTENIDO ÚNICO SCROLLABLE -->
  <div class="cantera-content">
    
    <!-- PARTE SUPERIOR (TITULO) -->
    <section class="hero-header">
      <h1 class="glow-text">CANTERA</h1>
      <p class="hero-subtitle">El futuro de la poesía empieza aquí</p>
      <div class="hero-line"></div>
    </section>

    <!-- PARTE INFERIOR (CTA SOLAMENTE) -->
    <section class="cantera-info">

      <div class="cta-section glass">
        <h3>¿Quieres participar?</h3>
        <p>Estamos buscando a la próxima generación de poetas de Alicante.</p>
        <button routerLink="/" class="btn-premium">Contactar ahora</button>
      </div>
    </section>

  </div>
</div>
```

### C. Estilos SCSS: `cantera.component.scss`
* **Ruta:** `d:\Slam\slam\src\app\features\landing\cantera\cantera.component.scss`
* **Detalles de Implementación:**
  * Uso de las variables globales del sistema de diseño (ej. `var(--primary)`, `var(--bg)`, `var(--off-white)`).
  * Fondo inmersivo con `object-fit: cover`, filtro de contraste/brillo y desenfoque suave (`blur(1.5px)`).
  * Degradado oscuro vertical para lograr una **transición fluida e imperceptible hacia el Footer global**.
  * Tipografías y efectos premium: `.glow-text` (`text-shadow: 0 0 30px rgba(var(--primary-rgb), 0.5)`).
  * Efecto hover premium en la tarjeta `.glass` con desplazamiento vertical (`translateY(-12px)`) y cambio de color del borde al primario con resplandor.
  * **Inconsistencia técnica detectada:** El archivo contiene estilos para clases que **no están mapeadas en el HTML actual** (ej. `.info-grid` e `.info-card`). Esto sugiere que anteriormente existió o se diseñó un grid de tres columnas con tarjetas de información (con iconos y descripciones) que actualmente no está plasmado en el HTML.
  * Estilos adaptables y optimizados para dispositivos móviles a través de Media Queries.
* **Código Clave:**
```scss
// ... (Ver archivo completo para detalles de animaciones)
.cantera-info {
  max-width: 1200px;
  width: 100%;
  padding: 0 2rem 6rem;
  
  // Grid latente (no implementado en HTML)
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2.5rem;
    margin-bottom: 4rem;
  }

  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 28px;
    padding: 3.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: rgba(var(--primary-rgb), 0.08);
      border-color: var(--primary);
      transform: translateY(-12px);
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
  }
}
```

---

## 3. Integración en el Sistema de Rutas y SEO
* **Ruta:** `d:\Slam\slam\src\app\app-routing.module.ts`
* El componente está cargado bajo la ruta `/cantera`.
* Cuenta con metadatos de SEO personalizados dinámicos para indexación y posicionamiento:
```typescript
{
  path: 'cantera',
  component: CanteraComponent,
  data: {
    seo: {
      title: 'Cantera - Nuevas Voces',
      description: 'La Cantera es el espacio para nuevas voces del Poetry Slam Alicante. Jóvenes y artistas emergentes suben al escenario por primera vez.'
    }
  }
}
```

---

## 4. Guía de Estilos Global (`src/styles.scss`)
El sistema visual del proyecto está cimentado en un diseño **Cyberpunk minimalista oscuro**. Para mantener la coherencia estética en cualquier cambio que Claude Opus realice, se deben usar las siguientes variables globales:

* **Paleta de Colores:**
  * `--primary` / `--neon-green`: `#92D342` (Verde Neón principal)
  * `--primary-rgb`: `146, 211, 66`
  * `--secondary`: `#368475` (Verde Esmeralda secundario para hovers)
  * `--bg` / `--carbon-black`: `#1A1A1A` (Fondo carbón oscuro)
  * `--text` / `--off-white`: `#F2F2F2` (Texto claro y legible)
  * `--card-bg`: `#242424` (Gris oscuro para tarjetas sólidas)
* **Tipografías:**
  * `Bebas Neue` (Cursive/Display): Para títulos (`h1`, `h2`, `h3`), logotipos y botones de alto impacto. Siempre en mayúsculas (`text-transform: uppercase`).
  * `Inter` (Sans-Serif): Para cuerpo de texto y descripciones que requieren alta legibilidad.
* **Componentes de Botón:**
  * `.btn-primary` (Estilo sesgado dinámico al hover con `transform: skewX(-10deg)`)
  * `.btn-secondary` (Estilo contorno blanco con hover translúcido)
  * `.btn-outline` (Estilo borde neón y relleno neón brillante en hover)

---

## 5. Alineación con la Base de Datos (Supabase)
Actualmente, la base de datos cuenta con dos tablas principales de eventos y participantes en `supabase/schema.sql`:
1. `eventos` (id, nombre, descripcion, fecha, activo)
2. `participantes` (id, evento_id, nombre, orden)
3. `cronograma` (id, fecha, nombre, url_entradas, url_foto)

### Opciones de Diseño de Datos para Evolucionar la Cantera (Propuesta para Claude Opus):
Si se desea dinamizar la sección de Cantera (por ejemplo, mostrando los poetas que forman la cantera, sus clasificaciones, o eventos especiales de cantera), se plantean dos vías en la base de datos:

* **Opción A (Reutilización con Metadatos):**
  Agregar una columna `es_cantera` (BOOLEAN DEFAULT FALSE) en las tablas `eventos` y `participantes`. Esto permite que el sistema de votaciones interactivo actual (`/votar`) funcione de forma idéntica para los Slams principales y los Slams de la Cantera, simplemente filtrando los datos según el contexto.
* **Opción B (Tablas Separadas):**
  Crear una tabla específica `canteranos` o `participantes_cantera` si su flujo de gestión de perfiles o puntuación es independiente del flujo del Slam regular.

---

## 6. Hoja de Ruta Sugerida para Claude Opus (Roadmap de Implementación)

### Fase 1: Restaurar y Enriquecer el Contenido Visual (UI/UX)
1. **Activar el Grid de Tarjetas:** Usar las clases latentes de SCSS (`.info-grid`, `.info-card`) en el HTML para explicar los tres pilares de la Cantera:
   * **Talleres:** Formación en escritura y performance.
   * **Escenario Libre:** Primer contacto seguro con el micrófono.
   * **Torneo Cantera:** Competiciones amistosas para jóvenes poetas.
2. **Micro-interacciones:** Agregar transiciones suaves de entrada en scroll (`Intersection Observer` o librerías ligeras).
3. **Galería o Slider:** Integrar un visualizador de fotos o vídeos de ediciones anteriores utilizando el mismo diseño de tarjetas Glassmorphism.

### Fase 2: Formulario de Inscripción Dinámico
1. Crear un formulario reactivo en `cantera.component.ts` para que los poetas interesados puedan inscribirse.
2. Integrar con Supabase creando una tabla de solicitudes (`solicitudes_cantera`), de forma que las peticiones se guarden directamente en la base de datos en lugar de ser un simple enlace estático de contacto.

### Fase 3: Conexión con Supabase para Eventos Cantera
1. Desarrollar un servicio `CanteraService` para obtener los próximos eventos marcados como cantera.
2. Mostrar en tiempo real los "poetas canteranos destacados" o los próximos Slams juveniles de forma dinámica en la página.

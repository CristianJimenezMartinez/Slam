---
description: Norma de diseño UI para el fondo cinematográfico fijo (Fixed Backdrop Parallax) y viñeta teatral en vistas de landing y contenido
always_on: true
---

# Regla de Diseño UI: Fondo Cinematográfico Fijo y Viñeta Teatral

Para mantener total coherencia visual y simetría entre las diferentes páginas de la aplicación (Cantera, Calendario, Historia, Normas, etc.), se debe aplicar siempre el estándar de fondo fijo y viñeta suave descubierto y calibrado en Cantera:

## 1. Contenedor de Imagen Fija (`.hero-bg-container`)
```scss
.hero-bg-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background: var(--bg);
  overflow: hidden;
  pointer-events: none;

  .hero-bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 22%;
    opacity: 0.9;
    filter: contrast(1.08) brightness(0.85);
    transition: opacity 0.5s ease;
  }
}
```

## 2. Capa de Niebla y Viñeta Suave (`.hero-overlay`)
No usar viñetas densas ni opacas en el centro. Usar siempre la combinación de degradado lineal y radial con ventana central transparente para permitir que la luz y el foco cenital se aprecien con nitidez:

```scss
.hero-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;

  background:
    linear-gradient(to bottom,
      rgba(var(--bg-rgb), 0.5) 0%,
      transparent 18%,
      transparent 65%,
      rgba(var(--bg-rgb), 0.8) 90%,
      var(--bg) 100%
    ),
    radial-gradient(
      ellipse at 50% 32%,
      transparent 45%,
      rgba(var(--bg-rgb), 0.4) 85%,
      rgba(var(--bg-rgb), 0.85) 100%
    );
}
```

## 3. Efecto Cortina con el Footer
El contenido flota en `z-index: 2` con tarjetas de cristal `glass` (`backdrop-filter: blur(20px) saturate(170%)`). Al llegar al final de la página, el footer (`#0B0E13`) actúa como una cortina sólida que cubre el fondo fijo con un haz de luz láser superior.

import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

const SITE_NAME = 'Poetry Slam Alicante';
const SITE_URL = 'https://poetryslamalicante.com';
const DEFAULT_IMAGE = `${SITE_URL}/assets/images/logo.png`;
const DEFAULT_DESC = 'Competición de poesía en vivo en el Centro Cultural Las Cigarreras, Alicante. El jurado eres tú. Calendario, entradas y resultados.';

const LOCATION_SCHEMA = {
  '@type': 'Place',
  'name': 'Centro Cultural Las Cigarreras',
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': 'Calle San Carlos, 78',
    'addressLocality': 'Alicante',
    'postalCode': '03001',
    'addressRegion': 'Comunidad Valenciana',
    'addressCountry': 'ES'
  }
};

const ORGANIZER_SCHEMA = {
  '@type': 'Organization',
  'name': SITE_NAME,
  'url': SITE_URL
};

export interface PageSeo {
  title?: string;
  description?: string;
  path?: string;
}

export interface EventSeo {
  nombre: string;
  fecha: string;
  descripcion?: string;
  url_entradas?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {

  constructor(
    private titleService: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  /**
   * Configura título, descripción, canonical y OpenGraph para una página.
   */
  setPage(data: PageSeo): void {
    const fullTitle = data.title
      ? `${data.title} | ${SITE_NAME}`
      : `${SITE_NAME} | Poesía en Vivo en Las Cigarreras`;

    const desc = data.description || DEFAULT_DESC;
    const url = data.path ? `${SITE_URL}${data.path}` : SITE_URL;

    // Title
    this.titleService.setTitle(fullTitle);

    // Meta estándar
    this.meta.updateTag({ name: 'description', content: desc });

    // Canonical
    this.updateCanonical(url);

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:url', content: url });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
  }

  /**
   * Inyecta JSON-LD de un único evento (modo evento inminente / votar).
   */
  setEventJsonLd(event: EventSeo): void {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      'name': event.nombre,
      'startDate': event.fecha,
      'description': event.descripcion || `${event.nombre} – Poetry Slam en vivo en Las Cigarreras, Alicante.`,
      'eventStatus': 'https://schema.org/EventScheduled',
      'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
      'location': LOCATION_SCHEMA,
      'organizer': ORGANIZER_SCHEMA,
      'image': DEFAULT_IMAGE,
      ...(event.url_entradas ? {
        'offers': {
          '@type': 'Offer',
          'url': event.url_entradas,
          'availability': 'https://schema.org/InStock'
        }
      } : {})
    };
    this.setJsonLd(data, 'dynamic-jsonld');
  }

  /**
   * Inyecta JSON-LD de múltiples eventos (calendario / slider temporada).
   */
  setEventsJsonLd(events: EventSeo[]): void {
    if (!events || events.length === 0) return;

    const data = {
      '@context': 'https://schema.org',
      '@graph': events.map(ev => ({
        '@type': 'Event',
        'name': ev.nombre,
        'startDate': ev.fecha,
        'eventStatus': 'https://schema.org/EventScheduled',
        'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
        'location': LOCATION_SCHEMA,
        'organizer': ORGANIZER_SCHEMA,
        'image': DEFAULT_IMAGE,
        ...(ev.url_entradas ? {
          'offers': {
            '@type': 'Offer',
            'url': ev.url_entradas,
            'availability': 'https://schema.org/InStock'
          }
        } : {})
      }))
    };
    this.setJsonLd(data, 'events-jsonld');
  }

  /**
   * Limpia todos los bloques JSON-LD dinámicos al navegar.
   */
  clearJsonLd(): void {
    this.removeJsonLd('dynamic-jsonld');
    this.removeJsonLd('events-jsonld');
  }

  // ── Privados ──────────────────────────────────────────

  private setJsonLd(data: object, id: string): void {
    this.removeJsonLd(id);
    const script = this.doc.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', id);
    script.textContent = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }

  private removeJsonLd(id: string): void {
    const el = this.doc.getElementById(id);
    if (el) el.remove();
  }

  private updateCanonical(url: string): void {
    let link = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}

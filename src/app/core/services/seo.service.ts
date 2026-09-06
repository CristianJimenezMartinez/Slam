import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

const SITE_NAME = 'Poetry Slam Alicante';
const SITE_URL = 'https://poetryslamalicante.com';
const DEFAULT_IMAGE = `${SITE_URL}/assets/images/logo.png`;
const DEFAULT_DESC = 'El escenario de la poesía en vivo y la palabra viva en Alicante. Tu voz cuenta. Calendario, entradas y resultados.';

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
  robots?: string;
  image?: string;
}

export interface EventSeo {
  nombre: string;
  fecha: string;
  descripcion?: string;
  url_entradas?: string;
  ubicacion?: string;
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
    let fullTitle: string;
    if (data.title) {
      fullTitle = data.title.includes(SITE_NAME) ? data.title : `${data.title} | ${SITE_NAME}`;
    } else {
      fullTitle = `${SITE_NAME} | El Escenario de la Palabra Viva`;
    }

    const desc = data.description || DEFAULT_DESC;
    // Canonicalización limpia: despojar query params y fragments (?s=..., ?utm=...) para evitar duplicados en Google Search Console
    const cleanPath = data.path ? data.path.split('?')[0].split('#')[0] : '';
    const url = cleanPath && cleanPath !== '/' ? `${SITE_URL}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}` : SITE_URL;
    const image = data.image || DEFAULT_IMAGE;

    // Title
    this.titleService.setTitle(fullTitle);

    // Meta estándar
    this.meta.updateTag({ name: 'description', content: desc });
    
    if (data.robots) {
      this.meta.updateTag({ name: 'robots', content: data.robots });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });
    }

    // Canonical
    this.updateCanonical(url);

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image', content: image });
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
      'description': event.descripcion || `${event.nombre} – Poetry Slam en vivo en ${event.ubicacion || 'Las Cigarreras'}, Alicante.`,
      'eventStatus': 'https://schema.org/EventScheduled',
      'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
      'location': this.buildLocation(event.ubicacion),
      'organizer': ORGANIZER_SCHEMA,
      'image': DEFAULT_IMAGE,
      'isAccessibleForFree': !event.url_entradas,
      'offers': {
        '@type': 'Offer',
        'url': event.url_entradas || `${SITE_URL}/calendario`,
        'price': '0',
        'priceCurrency': 'EUR',
        'validFrom': event.fecha,
        'availability': 'https://schema.org/InStock'
      }
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
        'location': this.buildLocation(ev.ubicacion),
        'organizer': ORGANIZER_SCHEMA,
        'image': DEFAULT_IMAGE,
        'isAccessibleForFree': !ev.url_entradas,
        'offers': {
          '@type': 'Offer',
          'url': ev.url_entradas || `${SITE_URL}/calendario`,
          'price': '0',
          'priceCurrency': 'EUR',
          'validFrom': ev.fecha,
          'availability': 'https://schema.org/InStock'
        }
      }))
    };
    this.setJsonLd(data, 'events-jsonld');
  }

  /**
   * Inyecta JSON-LD estructurado de Formación / Talleres Educativos de Cantera (Optimizado para Google y Motores de IA).
   */
  setCanteraJsonLd(): void {
    const data = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'EducationalOrganization',
          '@id': `${SITE_URL}/cantera#organization`,
          'name': 'Cantera Poetry Slam Alicante',
          'url': `${SITE_URL}/cantera`,
          'description': 'Programa educativo y formativo de poesía escénica, oratoria y expresión creativa para colegios, institutos (IES) y jóvenes en la provincia de Alicante.',
          'areaServed': {
            '@type': 'AdministrativeArea',
            'name': 'Provincia de Alicante, Comunidad Valenciana'
          },
          'sameAs': [
            'https://www.instagram.com/poetryslamalicante/',
            'https://www.youtube.com/@poetryslamalicante'
          ]
        },
        {
          '@type': 'Course',
          '@id': `${SITE_URL}/cantera#course`,
          'name': 'Talleres Escolares de Poesía Escénica y Oratoria',
          'description': 'Talleres prácticos de escritura poética contemporánea, declamación escénica, pérdida del miedo a hablar en público y convivencia para alumnos de ESO, Bachillerato y Formación Profesional en Alicante.',
          'provider': {
            '@type': 'EducationalOrganization',
            'name': 'Poetry Slam Alicante & Ágora Reix',
            'url': `${SITE_URL}/cantera`
          },
          'educationalLevel': ['Educación Secundaria Obligatoria (ESO)', 'Bachillerato', 'Formación Profesional'],
          'inLanguage': 'es',
          'isAccessibleForFree': false,
          'hasCourseInstance': {
            '@type': 'CourseInstance',
            'courseMode': 'onsite',
            'location': {
              '@type': 'Place',
              'name': 'Centros Educativos e Institutos de la Provincia de Alicante',
              'address': {
                '@type': 'PostalAddress',
                'streetAddress': 'Calle San Carlos, 78',
                'addressLocality': 'Alicante',
                'addressRegion': 'Comunidad Valenciana',
                'addressCountry': 'ES'
              }
            }
          }
        },
        {
          '@type': 'EducationalOccupationalProgram',
          '@id': `${SITE_URL}/cantera#program`,
          'name': 'Programa Cantera de Poesía Escénica y Oratoria Juvenil',
          'description': 'Itinerario formativo extracurricular y curricular impartido por la formadora y poeta Ágora Reix, conectando la expresión en las aulas con el circuito oficial de Poetry Slam.',
          'provider': {
            '@type': 'Organization',
            'name': 'Poetry Slam Alicante',
            'url': SITE_URL
          },
          'occupationalCategory': 'Expresión Artística, Oratoria y Comunicación',
          'hasCourse': {
            '@id': `${SITE_URL}/cantera#course`
          }
        }
      ]
    };
    this.setJsonLd(data, 'cantera-jsonld');
  }

  /**
   * Limpia todos los bloques JSON-LD dinámicos al navegar.
   */
  clearJsonLd(): void {
    this.removeJsonLd('dynamic-jsonld');
    this.removeJsonLd('events-jsonld');
    this.removeJsonLd('cantera-jsonld');
  }

  // ── Privados ──────────────────────────────────────────

  private buildLocation(ubicacion?: string): object {
    const name = ubicacion || LOCATION_SCHEMA.name;
    return {
      '@type': 'Place',
      'name': name,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Calle San Carlos, 78',
        'addressLocality': 'Alicante',
        'postalCode': '03001',
        'addressRegion': 'Comunidad Valenciana',
        'addressCountry': 'ES'
      }
    };
  }

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

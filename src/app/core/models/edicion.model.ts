export interface PodioHonor {
  laurelOro: string;             // Ganador/a de la velada (Laurel de Oro)
  plumaPlata?: string;           // 2º Clasificado / Finalista de Honor (Pluma de Plata)
  liraBronce?: string;           // 3º Clasificado / Finalista de Honor (Lira de Bronce)
  distincionEspecial?: string;   // Distinción institucional (ej. Campeón de Temporada)
}

export interface SlamEdicion {
  id: string;
  temporada: string;             // "VII Temporada (2025-2026)"
  numero: number;                // 1, 2, 3, 4, 5, 6
  esFinal: boolean;              // true para la Gran Final
  titulo: string;                // "I Encuentro — VII Poetry Slam Alicante"
  subtitulo: string;             // "Inauguración de Temporada", "Gran Final del Torneo", etc.
  fecha: string;                 // ISO date
  fechaFormateada: string;       // "30 de abril de 2026"
  hora: string;                  // "20:00 h"
  ubicacion: string;             // "Caja Negra, Las Cigarreras" o "Casa de la Música, Las Cigarreras"
  presentador: string;           // "Ágora Reix"
  artistaInvitado?: string;      // Artista / Voz invitada de honor
  artistaSemblanza?: string;     // Semblanza literaria y musical de la voz invitada
  urlCartel: string;             // URL del cartel oficial en alta resolución
  podio: PodioHonor;             // Cuadro de honor sin números
  poetasParticipantes: string[]; // Constelación de poetas que subieron al escenario
  cronicaCorta: string;          // Frase o síntesis curatorial
  cronicaCuratorial: string;     // Crónica narrativa de la velada
}

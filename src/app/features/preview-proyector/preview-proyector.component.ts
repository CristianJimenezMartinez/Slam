import { Component, OnInit } from '@angular/core';
import { Resultado } from '../../core/services/votaciones.service';
import { Evento } from '../../core/services/eventos.service';

@Component({
  selector: 'app-preview-proyector',
  templateUrl: './preview-proyector.component.html',
  styleUrls: ['./preview-proyector.component.scss']
})
export class PreviewProyectorComponent implements OnInit {
  // Evento simulado
  eventoMock: Evento = {
    id: 'mock-evento-7',
    nombre: 'VII EDICIÓN – POETRY SLAM ALICANTE',
    descripcion: 'Encuentro mensual de poesía escénica y polipoesía oral.',
    fecha: '2026-08-30T20:00:00Z',
    activo: true,
    created_at: new Date().toISOString(),
    ubicacion: 'Teatro Las Cigarreras, Alicante',
    color_primario: '#7AE92B',
    color_secundario: '#12D1AE',
    votacion_activa: true,
    ronda_activa: 1
  };

  // Modos de visualización del simulador
  modoSimulador: 'ranking' | 'finalistas' | 'standby' = 'ranking';
  rondaActual: number = 1;

  // Lista de resultados simulados con puntuaciones reales sobre 10
  resultadosMock: Resultado[] = [
    {
      participante_id: 'p1',
      participante: 'Laura Sam',
      orden: 1,
      evento_id: 'mock-evento-7',
      evento: 'VII EDICIÓN',
      num_votos: 68,
      puntuacion_total: 629,
      puntuacion_media: 9.25,
      posicion: 1,
      ronda: 1,
      foto_url: 'assets/images/avatars/poeta1.png'
    },
    {
      participante_id: 'p2',
      participante: 'Dani Orviz',
      orden: 2,
      evento_id: 'mock-evento-7',
      evento: 'VII EDICIÓN',
      num_votos: 64,
      puntuacion_total: 556.8,
      puntuacion_media: 8.70,
      posicion: 2,
      ronda: 1,
      foto_url: 'assets/images/avatars/poeta2.png'
    },
    {
      participante_id: 'p3',
      participante: 'Salva Soler',
      orden: 3,
      evento_id: 'mock-evento-7',
      evento: 'VII EDICIÓN',
      num_votos: 61,
      puntuacion_total: 512.4,
      puntuacion_media: 8.40,
      posicion: 3,
      ronda: 1,
      foto_url: 'assets/images/avatars/poeta3.png'
    },
    {
      participante_id: 'p4',
      participante: 'Carlos B.',
      orden: 4,
      evento_id: 'mock-evento-7',
      evento: 'VII EDICIÓN',
      num_votos: 58,
      puntuacion_total: 461.1,
      puntuacion_media: 7.95,
      posicion: 4,
      ronda: 1,
      foto_url: 'assets/images/avatars/poeta4.png'
    },
    {
      participante_id: 'p5',
      participante: 'Elena R.',
      orden: 5,
      evento_id: 'mock-evento-7',
      evento: 'VII EDICIÓN',
      num_votos: 55,
      puntuacion_total: 420.7,
      puntuacion_media: 7.65,
      posicion: 5,
      ronda: 1,
      foto_url: 'assets/images/avatars/poeta5.png'
    },
    {
      participante_id: 'p6',
      participante: 'Marcos V.',
      orden: 6,
      evento_id: 'mock-evento-7',
      evento: 'VII EDICIÓN',
      num_votos: 52,
      puntuacion_total: 379.6,
      puntuacion_media: 7.30,
      posicion: 6,
      ronda: 1,
      foto_url: 'assets/images/avatars/poeta6.png'
    },
    {
      participante_id: 'p7',
      participante: 'Patricia L.',
      orden: 7,
      evento_id: 'mock-evento-7',
      evento: 'VII EDICIÓN',
      num_votos: 49,
      puntuacion_total: 338.1,
      puntuacion_media: 6.90,
      posicion: 7,
      ronda: 1,
      foto_url: 'assets/images/avatars/poeta7.png'
    },
    {
      participante_id: 'p8',
      participante: 'Sergio M.',
      orden: 8,
      evento_id: 'mock-evento-7',
      evento: 'VII EDICIÓN',
      num_votos: 46,
      puntuacion_total: 289.8,
      puntuacion_media: 6.30,
      posicion: 8,
      ronda: 1,
      foto_url: 'assets/images/avatars/poeta8.png'
    },
    {
      participante_id: 'p9',
      participante: 'Lucía G.',
      orden: 9,
      evento_id: 'mock-evento-7',
      evento: 'VII EDICIÓN',
      num_votos: 43,
      puntuacion_total: 236.5,
      puntuacion_media: 5.50,
      posicion: 9,
      ronda: 1,
      foto_url: 'assets/images/avatars/poeta9.png'
    }
  ];

  // Finalistas para la pantalla de revelación
  get finalistasMock(): Resultado[] {
    return this.resultadosMock.slice(0, 3);
  }

  ngOnInit(): void {
    document.documentElement.style.setProperty('--primary', '#7AE92B');
    document.documentElement.style.setProperty('--primary-rgb', '122, 233, 43');
  }

  cambiarRonda(r: number): void {
    this.rondaActual = r;
    this.eventoMock.ronda_activa = r;
  }

  cambiarModo(modo: 'ranking' | 'finalistas' | 'standby'): void {
    this.modoSimulador = modo;
  }

  simularVotoEnVivo(): void {
    // Aumenta los votos de los poetas de forma aleatoria para ver el dinamismo
    this.resultadosMock = this.resultadosMock.map(r => {
      const delta = (Math.random() * 0.2) - 0.08;
      const nuevaMedia = Math.min(10, Math.max(1, r.puntuacion_media + delta));
      return {
        ...r,
        num_votos: r.num_votos + 1,
        puntuacion_media: Number(nuevaMedia.toFixed(2))
      };
    }).sort((a, b) => b.puntuacion_media - a.puntuacion_media)
      .map((r, idx) => ({ ...r, posicion: idx + 1 }));
  }
}

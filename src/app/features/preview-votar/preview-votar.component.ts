import { Component, OnInit } from '@angular/core';

export interface MockPoeta {
  id: string;
  nombre: string;
  foto_url: string;
  orden: number;
  ronda: number;
}

@Component({
  selector: 'app-preview-votar',
  templateUrl: './preview-votar.component.html',
  styleUrls: ['./preview-votar.component.scss']
})
export class PreviewVotarComponent implements OnInit {
  // Mock Data
  eventoMock = {
    id: 'mock-evento-01',
    nombre: 'VII Edición – Poetry Slam Alicante',
    ubicacion: 'Caja Negra, Las Cigarreras',
    color_primario: '#7AE92B',
    color_secundario: '#12D1AE',
    ronda_activa: 2,
    votacion_activa: true
  };

  poetasMock: MockPoeta[] = [
    {
      id: 'poeta-1',
      nombre: 'Laura Sam',
      foto_url: 'assets/images/avatars/poeta1.png',
      orden: 1,
      ronda: 2
    },
    {
      id: 'poeta-2',
      nombre: 'Dani Orviz',
      foto_url: 'assets/images/avatars/poeta2.png',
      orden: 2,
      ronda: 2
    },
    {
      id: 'poeta-3',
      nombre: 'Salva Soler',
      foto_url: 'assets/images/avatars/poeta3.png',
      orden: 3,
      ronda: 2
    }
  ];

  poetaActivoIndex = 0;
  get poetaActivo(): MockPoeta {
    return this.poetasMock[this.poetaActivoIndex];
  }

  // Estados de simulación
  estadoActual: 'formulario' | 'exito' | 'standby' | 'bloqueado' = 'formulario';
  
  // Selección de puntuación
  puntuacionBase: number | null = null;
  tieneDecimal: boolean = false;
  
  // Estado de carga y feedback
  isSubmitting = false;
  votosRegistrados: { [poetaId: string]: number } = {};

  // Opciones de números del 1 al 10
  numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  ngOnInit(): void {
    document.documentElement.style.setProperty('--primary', this.eventoMock.color_primario);
    document.documentElement.style.setProperty('--secondary', this.eventoMock.color_secundario);
  }

  get puntuacionFinal(): number | null {
    if (this.puntuacionBase === null) return null;
    if (this.puntuacionBase === 10) return 10;
    return this.tieneDecimal ? this.puntuacionBase + 0.5 : this.puntuacionBase;
  }

  get etiquetaPuntuacion(): { texto: string; icono: string } {
    const nota = this.puntuacionFinal;
    if (nota === null) return { texto: 'SELECCIONA UNA NOTA', icono: 'none' };
    if (nota <= 3.5) return { texto: 'MEJORABLE', icono: 'hourglass' };
    if (nota <= 5.5) return { texto: 'CORRECTO', icono: 'scroll' };
    if (nota <= 7.5) return { texto: 'BUEN RECITADO', icono: 'lyre' };
    if (nota <= 8.5) return { texto: 'GRAN ACTUACIÓN', icono: 'quill' };
    return { texto: 'MAGIA ESCÉNICA', icono: 'crown' };
  }

  get colorTermico(): string {
    const nota = this.puntuacionFinal;
    if (nota === null) return '#94a3b8';
    if (nota <= 3.5) return '#ef4444'; // Rojo
    if (nota <= 5.5) return '#f59e0b'; // Ámbar
    if (nota <= 7.5) return '#06b6d4'; // Cian
    if (nota <= 8.5) return '#10b981'; // Esmeralda
    return '#7AE92B'; // Neón Lima
  }

  seleccionarNumero(num: number): void {
    this.puntuacionBase = num;
    // Si elige 10, no se puede añadir .5
    if (num === 10) {
      this.tieneDecimal = false;
    }
  }

  toggleDecimal(): void {
    if (this.puntuacionBase === null || this.puntuacionBase === 10) return;
    this.tieneDecimal = !this.tieneDecimal;
  }

  simularVoto(): void {
    if (this.puntuacionFinal === null) return;
    this.isSubmitting = true;

    setTimeout(() => {
      this.isSubmitting = false;
      this.votosRegistrados[this.poetaActivo.id] = this.puntuacionFinal!;
      this.estadoActual = 'exito';
    }, 700);
  }

  cambiarPoeta(index: number): void {
    this.poetaActivoIndex = index;
    this.puntuacionBase = null;
    this.tieneDecimal = false;
    
    // Si ya lo votó, va a éxito; si no, al formulario
    if (this.votosRegistrados[this.poetaActivo.id]) {
      this.estadoActual = 'exito';
    } else {
      this.estadoActual = 'formulario';
    }
  }

  resetearVotoActual(): void {
    delete this.votosRegistrados[this.poetaActivo.id];
    this.puntuacionBase = null;
    this.tieneDecimal = false;
    this.estadoActual = 'formulario';
  }

  getNotaVotada(): number {
    return this.votosRegistrados[this.poetaActivo.id] ?? this.puntuacionFinal ?? 8.5;
  }
}

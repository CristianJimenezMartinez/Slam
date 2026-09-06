import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { EventosService, Evento } from '../../core/services/eventos.service';
import { VotacionesService, Resultado } from '../../core/services/votaciones.service';
import { SeoService } from '../../core/services/seo.service';

export interface RondaTab {
  numero: number;
  nombre: string;
}

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.scss']
})
export class ResultadosComponent implements OnInit, OnDestroy {
  evento: Evento | null = null;
  listaEventos: Evento[] = [];
  resultados: Resultado[] = [];
  allResults: Resultado[] = [];
  rondasDisponibles: RondaTab[] = [];
  rondaSeleccionada: number = 2;
  loading = true;
  private channelSub: any;

  constructor(
    private eventosService: EventosService,
    private votacionesService: VotacionesService,
    private seo: SeoService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    // SEO base
    this.seo.setPage({
      title: 'Resultados',
      description: 'Rankings y resultados de las sesiones del Poetry Slam Alicante. Consulta las puntuaciones del público.',
      path: '/resultados'
    });

    this.initialLoad();
  }

  async initialLoad() {
    this.loading = true;
    
    // 1. Cargar todos los eventos para el selector
    const resAll = await this.eventosService.getEventos().toPromise();
    this.listaEventos = resAll?.data as Evento[] || [];

    // 2. Por defecto, cargar el primero (el más reciente/activo)
    if (this.listaEventos.length > 0) {
      const activo = this.listaEventos.find(e => e.activo);
      await this.seleccionarEvento(activo || this.listaEventos[0]);
    }

    this.loading = false;
  }

  async seleccionarEvento(evento: Evento) {
    this.loading = true;
    this.evento = evento;
    this.updateTheme(this.evento.color_primario);
    
    // Limpiar suscripción anterior si existe
    if (this.channelSub) {
      this.votacionesService.unsubscribe(this.channelSub);
      this.channelSub = null;
    }

    // Actualiza el SEO con el nombre del evento seleccionado
    this.seo.setPage({
      title: `Resultados – ${evento.nombre}`,
      description: `Resultados y puntuaciones de ${evento.nombre}. Poetry Slam Alicante.`,
      path: '/resultados'
    });

    await this.refreshResults();

    // Solo escuchamos en tiempo real si el evento tiene votación activa
    if (this.evento.votacion_activa) {
      this.channelSub = this.votacionesService.listenToVotaciones(this.evento.id, () => {
        this.ngZone.run(() => {
          this.refreshResults();
        });
      });
    }

    this.loading = false;
  }

  async refreshResults() {
    if (!this.evento) return;
    
    // 1. Obtener todos los resultados
    const res = await this.votacionesService.getResultados(this.evento.id).toPromise();
    this.allResults = (res?.data as Resultado[]) || [];
    
    // 2. Identificar rondas disponibles con datos
    const tieneQuema = this.allResults.some((r: any) => r.orden === 0);
    const rondasSet = new Set<number>(this.allResults.map((r: any) => Number(r.ronda) || 1));
    const rondasArray = Array.from(rondasSet).sort((a, b) => a - b);
    
    this.rondasDisponibles = [];
    if (rondasArray.includes(1) && tieneQuema) {
      this.rondasDisponibles.push({ numero: 1, nombre: '🔥 Demostración (La Quema)' });
    }
    
    const numClasif = tieneQuema ? 2 : 1;
    if (rondasArray.includes(numClasif) || (!tieneQuema && rondasArray.includes(1))) {
      this.rondasDisponibles.push({ numero: numClasif, nombre: '📍 Clasificatoria' });
    }
    
    if (rondasArray.includes(3)) {
      this.rondasDisponibles.push({ numero: 3, nombre: '🏆 Gran Final' });
    }

    // 3. Seleccionar por defecto la Gran Final si ya hay votos de final, sino clasificatoria
    if (rondasArray.includes(3) && !this.rondasDisponibles.some(r => r.numero === this.rondaSeleccionada)) {
      this.rondaSeleccionada = 3;
    } else if (!this.rondasDisponibles.some(r => r.numero === this.rondaSeleccionada)) {
      this.rondaSeleccionada = numClasif;
    }

    this.filtrarResultadosPorRonda();
  }

  cambiarRonda(ronda: number) {
    this.rondaSeleccionada = ronda;
    this.filtrarResultadosPorRonda();
  }

  private filtrarResultadosPorRonda() {
    this.resultados = this.allResults.filter((r: any) => (Number(r.ronda) || 1) === this.rondaSeleccionada);
  }

  ngOnDestroy(): void {
    if (this.channelSub) {
      this.votacionesService.unsubscribe(this.channelSub);
    }
  }

  private updateTheme(color?: string) {
    if (!color) return;
    document.documentElement.style.setProperty('--primary', color);
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
  }
}

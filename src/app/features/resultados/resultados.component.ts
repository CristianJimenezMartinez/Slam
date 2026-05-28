import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { EventosService, Evento } from '../../core/services/eventos.service';
import { VotacionesService, Resultado } from '../../core/services/votaciones.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.scss']
})
export class ResultadosComponent implements OnInit, OnDestroy {
  evento: Evento | null = null;
  listaEventos: Evento[] = [];
  resultados: Resultado[] = [];
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
      // Intentamos buscar el que esté activo manualmente
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
      this.channelSub.unsubscribe();
    }

    // Actualiza el SEO con el nombre del evento seleccionado
    this.seo.setPage({
      title: `Resultados – ${evento.nombre}`,
      description: `Resultados y puntuaciones de ${evento.nombre}. Poetry Slam Alicante.`,
      path: '/resultados'
    });

    await this.refreshResults();

    // Solo escuchamos en tiempo real si el evento es "reciente" o tiene votación abierta
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
    const { data } = await this.votacionesService.getResultados(this.evento.id).toPromise();
    const allResults = data || [];
    
    // 2. Determinar si es un evento nuevo con quema (el de demostración tiene orden === 0)
    const tieneQuema = allResults.some((r: any) => r.orden === 0);
    
    let rondaClasificatoria = 1;
    if (tieneQuema) {
      // Evento nuevo (La Quema = R1, Clasificatoria = R2, Final = R3)
      // La clasificatoria oficial en la landing web es siempre la ronda 2
      rondaClasificatoria = 2;
    } else {
      // Evento antiguo sin quema: la clasificatoria es la ronda 1
      rondaClasificatoria = 1;
    }
    
    // Filtramos para mostrar únicamente la clasificatoria oficial (ocultando La Quema)
    this.resultados = allResults.filter((r: any) => r.ronda === rondaClasificatoria);
  }

  ngOnDestroy(): void {
    if (this.channelSub) {
      this.channelSub.unsubscribe();
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

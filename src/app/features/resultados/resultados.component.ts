import { Component, OnDestroy, OnInit } from '@angular/core';
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
    private seo: SeoService
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
        this.refreshResults();
      });
    }

    this.loading = false;
  }

  async refreshResults() {
    if (!this.evento) return;
    const { data } = await this.votacionesService.getResultados(this.evento.id).toPromise();
    this.resultados = data || [];
  }

  ngOnDestroy(): void {
    if (this.channelSub) {
      this.channelSub.unsubscribe();
    }
  }
}

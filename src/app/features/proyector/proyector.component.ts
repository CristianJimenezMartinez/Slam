import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { EventosService, Evento } from '../../core/services/eventos.service';
import { VotacionesService, Resultado } from '../../core/services/votaciones.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-proyector',
  templateUrl: './proyector.component.html',
  styleUrls: ['./proyector.component.scss']
})
export class ProyectorComponent implements OnInit, OnDestroy {
  evento: Evento | null = null;
  resultados: Resultado[] = [];
  loading = true;
  mostrarResultados = false;
  
  private channelSub: any;
  private eventoSub: Subscription | any = null;

  constructor(
    private eventosService: EventosService,
    private votacionesService: VotacionesService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadActiveEvent();
  }

  async loadActiveEvent() {
    this.loading = true;
    try {
      const ev = await this.eventosService.getEventoActivo().toPromise();
      this.evento = ev || null;

      if (this.evento) {
        this.mostrarResultados = !!this.evento.votacion_activa;
        await this.refreshResults();

        // Escuchar cambios en los votos
        this.channelSub = this.votacionesService.listenToVotaciones(this.evento.id, () => {
          this.ngZone.run(() => {
            this.refreshResults();
          });
        });

        // Escuchar cambios en el evento (para saber si se cierran las votaciones)
        this.eventoSub = this.eventosService.listenToEventoChanges(this.evento.id, (payload: any) => {
          this.ngZone.run(() => {
            if (payload.new) {
              this.evento = { ...this.evento, ...payload.new } as Evento;
              this.mostrarResultados = !!this.evento.votacion_activa;
            }
          });
        });
      }
    } catch (e) {
      console.error('Error cargando datos del proyector:', e);
    } finally {
      this.loading = false;
    }
  }

  async refreshResults() {
    if (!this.evento) return;
    const { data } = await this.votacionesService.getResultados(this.evento.id).toPromise();
    this.resultados = data || [];
  }

  ngOnDestroy(): void {
    if (this.channelSub) this.channelSub.unsubscribe();
    if (this.eventoSub) this.eventoSub.unsubscribe();
  }
}

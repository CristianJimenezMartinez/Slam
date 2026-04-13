import { Component, OnDestroy, OnInit } from '@angular/core';
import { EventosService, Evento } from '../../core/services/eventos.service';
import { VotacionesService, Resultado } from '../../core/services/votaciones.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.scss']
})
export class ResultadosComponent implements OnInit, OnDestroy {
  evento: Evento | null = null;
  resultados: Resultado[] = [];
  loading = true;
  private channelSub: any;

  constructor(
    private eventosService: EventosService,
    private votacionesService: VotacionesService
  ) { }

  ngOnInit(): void {
    this.loadEventAndResults();
  }

  async loadEventAndResults() {
    this.loading = true;
    let res = await this.eventosService.getEventoActivo().toPromise();
    this.evento = res || null;

    if (!this.evento) {
      // If no active, try to get the most recent one
      const resAll = await this.eventosService.getEventos().toPromise();
      const list = resAll?.data as any[] || [];
      if (list.length > 0) {
        this.evento = list[0]; // Most recent by date
      }
    }

    if (this.evento) {
      await this.refreshResults();

      // Listen for real-time votes to trigger a refresh
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

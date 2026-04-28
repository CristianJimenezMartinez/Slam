import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ParticipantesService, Participante } from '../../../../../core/services/participantes.service';
import { Evento, EventosService } from '../../../../../core/services/eventos.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-live-control',
  templateUrl: './live-control.component.html',
  styleUrls: ['./live-control.component.scss']
})
export class LiveControlComponent implements OnInit, OnDestroy {
  evento: Evento | null = null;
  participantes: Participante[] = [];
  activoId: string | null = null;
  loading = true;
  mostrarPuntuaciones = false;

  private eventoSub: Subscription | any = null;

  constructor(
    private eventosService: EventosService,
    private participantesService: ParticipantesService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadActiveEvent();
  }

  async loadActiveEvent() {
    this.loading = true;
    try {
      const res = await this.eventosService.getEventoActivo().toPromise();
      const ev = res || null;
      
      // Solo mostramos el panel si hay un evento con votación activa
      if (ev && ev.votacion_activa) {
        this.evento = ev;
        this.activoId = ev.participante_activo_id || null;
        this.mostrarPuntuaciones = !!ev.puntuaciones_activas;

        const resParts = await this.participantesService.getParticipantesByEvento(this.evento.id).toPromise();
        this.participantes = (resParts?.data || []) as Participante[];
        
        // Suscribirse a cambios si queremos refrescar
        this.eventoSub = this.eventosService.listenToEventoChanges(this.evento.id, (payload: any) => {
          this.ngZone.run(() => {
            if (payload.new) {
              if ('participante_activo_id' in payload.new) {
                this.activoId = payload.new.participante_activo_id || null;
              }
              // Si le apagan la votacion global
              if ('votacion_activa' in payload.new && !payload.new.votacion_activa) {
                this.evento = null;
              }
            }
          });
        });
      } else {
        this.evento = null;
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  async abrirVotacion(participanteId: string) {
    if (!this.evento) return;
    this.activoId = participanteId; // Optimistic update
    const res = await this.eventosService.setParticipanteActivo(this.evento.id, participanteId);
    if (res.error) console.error('Error abrirVotacion:', res.error);
  }

  async cerrarVotaciones() {
    if (!this.evento) return;
    this.activoId = null; // Optimistic update
    const res = await this.eventosService.setParticipanteActivo(this.evento.id, null);
    if (res.error) console.error('Error cerrarVotaciones:', res.error);
  }
  
  async togglePuntuaciones() {
    if (!this.evento) return;
    this.mostrarPuntuaciones = !this.mostrarPuntuaciones;
    const res = await this.eventosService.togglePuntuacionesVisibles(this.evento.id, this.mostrarPuntuaciones);
    if (res.error) console.error('Error togglePuntuaciones:', res.error);
  }

  isConfirmModalOpen = false;

  solicitarFinalizarVotaciones() {
    this.isConfirmModalOpen = true;
  }

  async confirmarFinalizarVotaciones() {
    if (!this.evento) return;
    this.isConfirmModalOpen = false;
    this.loading = true;
    try {
      await this.eventosService.setParticipanteActivo(this.evento.id, null);
      await this.eventosService.toggleVotacion(this.evento.id, false);
      this.evento = null;
      this.activoId = null;
    } catch (e) {
      console.error('Error al finalizar votaciones:', e);
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy() {
    if (this.eventoSub) {
      this.eventoSub.unsubscribe();
    }
  }
}

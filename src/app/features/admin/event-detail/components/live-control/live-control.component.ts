import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ParticipantesService, Participante } from '../../../../../core/services/participantes.service';
import { Evento, EventosService } from '../../../../../core/services/eventos.service';
import { VotacionesService, Resultado } from '../../../../../core/services/votaciones.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-live-control',
  templateUrl: './live-control.component.html',
  styleUrls: ['./live-control.component.scss']
})
export class LiveControlComponent implements OnInit, OnDestroy {
  evento: Evento | null = null;
  participantes: Participante[] = [];
  finalistasIds: string[] = [];
  activoId: string | null = null;
  loading = true;
  mostrarPuntuaciones = false;
  rondaActual = 1;

  private eventoSub: Subscription | any = null;

  constructor(
    private eventosService: EventosService,
    private participantesService: ParticipantesService,
    private votacionesService: VotacionesService,
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
      
      if (ev && ev.votacion_activa) {
        this.evento = ev;
        this.activoId = ev.participante_activo_id || null;
        this.mostrarPuntuaciones = !!ev.puntuaciones_activas;
        this.rondaActual = ev.ronda_activa || 1;

        const resParts = await this.participantesService.getParticipantesByEvento(this.evento.id).toPromise();
        this.participantes = (resParts?.data || []) as Participante[];
        
        if (this.rondaActual === 2) {
          await this.cargarFinalistas();
        }

        // Suscribirse a cambios
        if (this.eventoSub) this.eventoSub.unsubscribe();
        this.eventoSub = this.eventosService.listenToEventoChanges(this.evento.id, (payload: any) => {
          this.ngZone.run(async () => {
            if (payload.new) {
              const oldRonda = this.rondaActual;
              this.evento = { ...this.evento, ...payload.new } as Evento;
              this.rondaActual = payload.new.ronda_activa || 1;
              this.activoId = payload.new.participante_activo_id || null;
              this.mostrarPuntuaciones = !!payload.new.puntuaciones_activas;

              if (this.rondaActual === 2 && oldRonda === 1) {
                await this.cargarFinalistas();
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

  async cargarFinalistas() {
    if (!this.evento) return;
    const res = await this.votacionesService.getResultados(this.evento.id, 1).toPromise();
    if (res?.data) {
      const resultados = res.data as Resultado[];
      // Tomamos los 3 primeros (el ranking de la vista ya viene ordenado)
      this.finalistasIds = resultados.slice(0, 3).map(r => r.participante_id);
    }
  }

  get participantesFiltrados(): Participante[] {
    if (this.rondaActual === 1) return this.participantes;
    return this.participantes.filter(p => this.finalistasIds.includes(p.id));
  }

  async abrirVotacion(participanteId: string) {
    if (!this.evento) return;
    this.activoId = participanteId;
    await this.eventosService.setParticipanteActivo(this.evento.id, participanteId);
  }

  async cerrarVotaciones() {
    if (!this.evento) return;
    this.activoId = null;
    await this.eventosService.setParticipanteActivo(this.evento.id, null);
  }

  async finalizarRonda1() {
    if (!this.evento || !confirm('¿Estás seguro de finalizar la Ronda 1? Esto calculará los 3 finalistas y pasará a la final.')) return;
    this.loading = true;
    try {
      await this.eventosService.setParticipanteActivo(this.evento.id, null);
      await this.eventosService.setRonda(this.evento.id, 2);
      // El refresco vendrá por el Realtime y cargará los finalistas
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
  
  async togglePuntuaciones() {
    if (!this.evento) return;
    this.mostrarPuntuaciones = !this.mostrarPuntuaciones;
    await this.eventosService.togglePuntuacionesVisibles(this.evento.id, this.mostrarPuntuaciones);
  }

  async toggleRegistroQR() {
    if (!this.evento) return;
    const nuevoEstado = !this.evento.registro_pin_abierto;
    this.evento.registro_pin_abierto = nuevoEstado;
    await this.eventosService.updateEvento(this.evento.id, { registro_pin_abierto: nuevoEstado });
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
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy() {
    if (this.eventoSub) this.eventoSub.unsubscribe();
  }
}

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
  poetaQuema: Participante | null = null;
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
        this.rondaActual = Number(ev.ronda_activa) || 1;

        const resParts = await this.participantesService.getParticipantesByEvento(this.evento.id).toPromise();
        const allParts = (resParts?.data || []) as Participante[];
        this.poetaQuema = allParts.find(p => p.orden === 0) || null;
        this.participantes = allParts.filter(p => p.orden > 0);
        
        if (this.rondaActual === 3) {
          await this.cargarFinalistas();
        }

        // Suscribirse a cambios (Limpiando suscripción previa si existe)
        if (this.eventoSub) {
          this.eventoSub.unsubscribe();
        }

        this.eventoSub = this.eventosService.listenToEventoChanges(this.evento.id, (payload: any) => {
          this.ngZone.run(async () => {
            if (payload.new) {
              const oldRonda = this.rondaActual;
              const newRonda = Number(payload.new.ronda_activa) || 1;
              const newActivoId = payload.new.participante_activo_id || null;
              const newPuntuaciones = !!payload.new.puntuaciones_activas;

              // Solo actualizamos si los valores han cambiado realmente
              // Esto evita el parpadeo si llegan múltiples actualizaciones rápidas
              if (this.activoId !== newActivoId) {
                this.activoId = newActivoId;
              }
              
              if (this.rondaActual !== newRonda) {
                this.rondaActual = newRonda;
                if (this.rondaActual === 3 && oldRonda < 3) {
                  await this.cargarFinalistas();
                }
              }

              if (this.mostrarPuntuaciones !== newPuntuaciones) {
                this.mostrarPuntuaciones = newPuntuaciones;
              }

              // Actualizamos el objeto evento manteniendo los datos que ya tenemos
              this.evento = { ...this.evento, ...payload.new } as Evento;
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
    const res = await this.votacionesService.getResultados(this.evento.id, 2).toPromise(); // Cargamos de la Ronda 2 (Clasificatoria)
    if (res?.data) {
      const resultados = res.data as Resultado[];
      if (resultados.length > 0) {
        // Encontrar la puntuación del N-ésimo participante configurado (o el último si hay menos)
        const limit = this.evento.limite_finalistas || 3;
        const indexCorte = Math.min(limit - 1, resultados.length - 1);
        const puntuacionCorte = resultados[indexCorte].puntuacion_total;
        
        // Incluimos a todos los que empaten o superen la puntuación de corte para evitar dejarlos fuera
        this.finalistasIds = resultados
          .filter(r => r.puntuacion_total >= puntuacionCorte)
          .map(r => r.participante_id);
      } else {
        this.finalistasIds = [];
      }
    }
  }

  get participantesFiltrados(): Participante[] {
    if (this.rondaActual === 1 || this.rondaActual === 2) return this.participantes;
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

  async finalizarQuema() {
    if (!this.evento || !confirm('¿Estás seguro de finalizar la Ronda de Demostración (La Quema)? Esto comenzará la Ronda 1: Clasificatoria.')) return;
    this.loading = true;
    try {
      await this.eventosService.setParticipanteActivo(this.evento.id, null);
      await this.eventosService.setRonda(this.evento.id, 2);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  async volverALaQuema() {
    if (!this.evento || !confirm('¿Quieres volver a la Ronda de Demostración (La Quema)? Se mantendrán los votos de prueba.')) return;
    this.loading = true;
    try {
      await this.eventosService.setRonda(this.evento.id, 1);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  async finalizarRondaClasificatoria() {
    if (!this.evento || !confirm('¿Estás seguro de finalizar la Ronda 1: Clasificatoria? Esto calculará los finalistas y pasará a la gran final.')) return;
    this.loading = true;
    try {
      await this.eventosService.setParticipanteActivo(this.evento.id, null);
      await this.eventosService.setRonda(this.evento.id, 3);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  async volverARondaClasificatoria() {
    if (!this.evento || !confirm('¿Quieres volver a la Ronda 1: Clasificatoria?')) return;
    this.loading = true;
    try {
      await this.eventosService.setRonda(this.evento.id, 2);
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

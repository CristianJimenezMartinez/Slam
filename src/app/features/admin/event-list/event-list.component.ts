import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EventosService, Evento } from '../../../core/services/eventos.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  @Input() set mode(value: 'active' | 'past') {
    this._mode = value;
    if (this._isInitialized) {
      this.loadEventos();
    }
  }
  get mode() { return this._mode; }
  private _mode: 'active' | 'past' = 'active';
  private _isInitialized = false;

  @Output() edit = new EventEmitter<Evento>();
  @Output() controlLive = new EventEmitter<void>();
  eventos$: Observable<any> = new Observable();
  loading = false;

  constructor(private eventosService: EventosService) { }

  ngOnInit(): void {
    this._isInitialized = true;
    this.loadEventos();
  }

  loadEventos() {
    this.loading = true;
    this.eventos$ = this.eventosService.getEventos().pipe(
      map(res => ({
        ...res,
        data: (res?.data || []).filter((ev: Evento) => 
          this.mode === 'past' ? this.isEventLocked(ev) : !this.isEventLocked(ev)
        )
      })),
      tap(() => this.loading = false)
    );
  }

  isEventLocked(evento: Evento): boolean {
    // Un evento está cerrado (bloqueado) si su fecha ya pasó y no está en la portada.
    // Esto permite seguir editando eventos futuros que aún no están en portada.
    const isPast = new Date(evento.fecha).getTime() < new Date().getTime();
    return isPast && !evento.activo;
  }

  async toggleActivo(evento: Evento) {
    if (evento.activo) {
      await this.eventosService.deactivateAll();
    } else {
      await this.eventosService.setActivo(evento.id);
    }
    this.loadEventos();
  }

  async toggleVotacion(evento: Evento) {
    await this.eventosService.toggleVotacion(evento.id, !evento.votacion_activa);
    this.loadEventos();
  }

  async deleteEvento(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      await this.eventosService.deleteEvento(id);
      this.loadEventos();
    }
  }
}

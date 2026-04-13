import { Component, OnInit } from '@angular/core';
import { EventosService, Evento } from '../../../core/services/eventos.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  eventos$: Observable<any> = new Observable();

  constructor(private eventosService: EventosService) { }

  ngOnInit(): void {
    this.loadEventos();
  }

  loadEventos() {
    this.eventos$ = this.eventosService.getEventos();
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

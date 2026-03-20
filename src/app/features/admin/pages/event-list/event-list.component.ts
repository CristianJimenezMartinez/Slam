import { Component, OnInit } from '@angular/core';
import { EventosService, Evento } from '../../../../core/services/eventos.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  eventos$: Observable<any> = new Observable();

  constructor(private eventosService: EventosService) {}

  ngOnInit(): void {
    this.loadEventos();
  }

  loadEventos() {
    this.eventos$ = this.eventosService.getEventos();
  }

  async toggleActivo(evento: Evento) {
    if (evento.activo) {
      await this.eventosService.deactivateAll();
    } else {
      await this.eventosService.setActivo(evento.id);
    }
    this.loadEventos();
  }

  async deleteEvento(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      await this.eventosService.deleteEvento(id);
      this.loadEventos();
    }
  }
}

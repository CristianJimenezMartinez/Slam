import { Component, OnInit } from '@angular/core';
import { EventosService, Evento } from '../../../core/services/eventos.service';

@Component({
  selector: 'app-historia',
  templateUrl: './historia.component.html',
  styleUrls: ['./historia.component.scss']
})
export class HistoriaComponent implements OnInit {
  eventos: Evento[] = [];
  loading = true;

  constructor(private eventosService: EventosService) { }

  ngOnInit(): void {
    this.eventosService.getEventos().subscribe(res => {
      this.loading = false;
      if (res && res.data) {
        // Filtrar para mostrar solo los eventos pasados (inactivos)
        const allEventos = res.data as Evento[];
        // TODO: Restaurar el filtro una vez revisado en producción:
        // this.eventos = allEventos.filter(ev => !ev.activo);
        this.eventos = allEventos;
      }
    });
  }
}

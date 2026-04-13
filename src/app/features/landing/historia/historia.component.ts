import { Component, OnInit } from '@angular/core';
import { CronogramaService, Cronograma } from '../../../core/services/cronograma.service';

@Component({
  selector: 'app-historia',
  templateUrl: './historia.component.html',
  styleUrls: ['./historia.component.scss']
})
export class HistoriaComponent implements OnInit {
  proximos: Cronograma[] = [];
  pasados: Cronograma[] = [];
  loading = true;
  currentYear = new Date().getFullYear();

  constructor(private cronogramaService: CronogramaService) { }

  ngOnInit(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.cronogramaService.getCronograma().subscribe(res => {
      this.loading = false;
      if (res && res.data) {
        const all = res.data as Cronograma[];
        
        // El cronograma ya viene ordenado por fecha desde el servicio
        this.proximos = all.filter(ev => new Date(ev.fecha) >= today);
        this.pasados = all.filter(ev => new Date(ev.fecha) < today).reverse();
      }
    });
  }

  isEventToday(fecha: string): boolean {
    const eventDate = new Date(fecha).toDateString();
    const today = new Date().toDateString();
    return eventDate === today;
  }
}

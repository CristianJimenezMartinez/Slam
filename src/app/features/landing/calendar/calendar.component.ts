import { Component, OnInit } from '@angular/core';
import { CronogramaService, Cronograma } from '../../../core/services/cronograma.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  proximos: Cronograma[] = [];
  pasados: Cronograma[] = [];
  loading = true;
  currentYear = new Date().getFullYear();

  constructor(
    private cronogramaService: CronogramaService,
    private seo: SeoService
  ) { }

  ngOnInit(): void {
    this.seo.setPage({
      title: `Calendario ${this.currentYear}`,
      description: `Todas las fechas del Poetry Slam Alicante ${this.currentYear}. Próximas citas y archivo de la temporada en Las Cigarreras.`,
      path: '/calendario'
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.cronogramaService.getCronograma().subscribe(res => {
      this.loading = false;
      if (res && res.data) {
        const all = res.data as Cronograma[];
        
        this.proximos = all.filter(ev => new Date(ev.fecha) >= today);
        this.pasados = all.filter(ev => new Date(ev.fecha) < today).reverse();

        if (this.proximos.length > 0) {
          this.seo.setEventsJsonLd(this.proximos);
        }
      }
    });
  }

  isEventToday(fecha: string): boolean {
    const eventDate = new Date(fecha).toDateString();
    const today = new Date().toDateString();
    return eventDate === today;
  }
}

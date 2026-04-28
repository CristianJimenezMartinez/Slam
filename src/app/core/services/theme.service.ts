import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, filter, switchMap, startWith } from 'rxjs/operators';
import { EventosService, Evento } from './eventos.service';
import { CronogramaService, Cronograma } from './cronograma.service';
import { Router, NavigationEnd } from '@angular/router';

export interface ThemeColors {
  primary: string;
  secondary: string;
  bg: string;
  text: string;
  header: string;
  isSeason: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeColors | null>(null);
  theme$ = this.themeSubject.asObservable();
  
  private refreshSubject = new BehaviorSubject<void>(undefined);

  constructor(
    private eventosService: EventosService,
    private cronogramaService: CronogramaService,
    private router: Router
  ) {
    this.initThemeLogic();
  }

  private initThemeLogic() {
    combineLatest([
      this.refreshSubject.pipe(
        switchMap(() => this.eventosService.getEventoActivo())
      ),
      this.refreshSubject.pipe(
        switchMap(() => this.cronogramaService.getCronograma())
      ),
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.url),
        startWith(this.router.url)
      )
    ]).subscribe(([evento, cronogramaRes, currentUrl]) => {
      const cronograma = (cronogramaRes.data as Cronograma[]) || [];
      const seasonSettings = cronograma.length > 0 ? cronograma[0] : null;

      const theme = this.calculateActiveTheme(evento, seasonSettings, currentUrl);
      this.themeSubject.next(theme);
    });

    // Suscribirse en tiempo real a cambios en Eventos
    this.eventosService.listenToAllEventosChanges(() => {
      this.refreshSubject.next();
    });

    // Suscribirse en tiempo real a cambios en Cronograma
    this.cronogramaService.listenToCronogramaChanges(() => {
      this.refreshSubject.next();
    });
  }

  private calculateActiveTheme(evento: Evento | null, season: Cronograma | null, url: string): ThemeColors {
    let isInminent = false;
    const isEventSpecificPage = url.includes('/votar') || url.includes('/resultados') || url.includes('/puntuaciones');

    if (evento) {
      const fechaEvento = new Date(evento.fecha);
      const hoy = new Date();
      const diffTime = fechaEvento.getTime() - hoy.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Regla de los 7 días
      isInminent = diffDays <= 7 && diffDays >= 0;
    }

    // 1. Prioridad: Evento Inminente O Página Específica de Evento
    if (evento && (isInminent || isEventSpecificPage)) {
      return {
        primary: evento.color_primario || '#92D342',
        secondary: evento.color_secundario || '#368475',
        bg: evento.color_fondo || '#1A1A1A',
        text: evento.color_texto || '#F2F2F2',
        header: evento.color_cabecera || '#1A1A1A',
        isSeason: false
      };
    }

    // 2. Fallback: Colores de Temporada
    if (season && (season.color_primario || season.color_fondo)) {
      return {
        primary: season.color_primario || '#92D342',
        secondary: season.color_secundario || '#368475',
        bg: season.color_fondo || '#1A1A1A',
        text: season.color_texto || '#F2F2F2',
        header: season.color_cabecera || '#1A1A1A',
        isSeason: true
      };
    }

    // 3. Fallback final: Tema Original
    return {
      primary: '#92D342',
      secondary: '#368475',
      bg: '#1A1A1A',
      text: '#F2F2F2',
      header: 'rgba(26, 26, 26, 0.95)',
      isSeason: true
    };
  }
}

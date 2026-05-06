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
  // Variables procesadas para CSS
  cssVars?: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeColors | null>(this.loadCachedTheme());
  theme$ = this.themeSubject.asObservable();
  
  private refreshSubject = new BehaviorSubject<void>(undefined);

  constructor(
    private eventosService: EventosService,
    private cronogramaService: CronogramaService,
    private router: Router
  ) {
    this.initThemeLogic();
  }

  private loadCachedTheme(): ThemeColors | null {
    try {
      const cached = localStorage.getItem('slam_theme');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
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
      const processedTheme = this.processTheme(theme);
      
      localStorage.setItem('slam_theme', JSON.stringify(processedTheme));
      this.themeSubject.next(processedTheme);
    });

    // Suscribirse en tiempo real
    this.eventosService.listenToAllEventosChanges(() => this.refreshSubject.next());
    this.cronogramaService.listenToCronogramaChanges(() => this.refreshSubject.next());
  }

  private calculateActiveTheme(evento: Evento | null, season: Cronograma | null, url: string): ThemeColors {
    let isInminent = false;
    const isEventSpecificPage = url.includes('/votar') || url.includes('/resultados') || url.includes('/puntuaciones');

    if (evento) {
      const fechaEvento = new Date(evento.fecha);
      const hoy = new Date();
      const diffTime = fechaEvento.getTime() - hoy.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isInminent = diffDays <= 7 && diffDays >= 0;
    }

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

    return {
      primary: '#92D342',
      secondary: '#368475',
      bg: '#1A1A1A',
      text: '#F2F2F2',
      header: 'rgba(26, 26, 26, 0.95)',
      isSeason: true
    };
  }

  private processTheme(theme: ThemeColors): ThemeColors {
    const cssVars: Record<string, string> = {
      '--primary': theme.primary,
      '--neon-green': theme.primary,
      '--primary-rgb': this.hexToRgb(theme.primary),
      '--primary-contrast': this.getContrastColor(theme.primary),
      '--secondary': theme.secondary,
      '--header-bg': theme.header,
      '--header-bg-rgb': this.hexToRgb(theme.header),
      '--header-contrast': this.getContrastColor(theme.header),
      '--bg': theme.bg,
      '--carbon-black': theme.bg,
      '--bg-rgb': this.hexToRgb(theme.bg),
      '--bg-contrast': this.getContrastColor(theme.bg),
      '--text': theme.text,
      '--off-white': theme.text
    };

    return { ...theme, cssVars };
  }

  private hexToRgb(hex: string): string {
    hex = hex.replace('#', '').trim();
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return isNaN(r) ? '146, 211, 66' : `${r}, ${g}, ${b}`;
  }

  private getContrastColor(hexColor: string): string {
    let hex = hexColor.replace('#', '').trim();
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#151124' : '#FFFFFF';
  }
}

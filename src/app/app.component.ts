import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { SeoService } from './core/services/seo.service';
import { EventosService } from './core/services/eventos.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'slam';
  isMenuOpen = false;
  mostrarMenuVotar = false;
  mostrarMenuPuntuaciones = false;
  eventoId: string | null = null;
  private eventoActivoSub: any;

  constructor(
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private seo: SeoService,
    private eventosService: EventosService,
    private themeService: ThemeService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.seo.clearJsonLd();
      let currentRoute = this.route;
      while (currentRoute.firstChild) {
        currentRoute = currentRoute.firstChild;
      }
      const data = currentRoute.snapshot.data;
      if (data['seo']) {
        this.seo.setPage({
          title: data['seo'].title,
          description: data['seo'].description,
          robots: data['seo'].robots,
          path: event.urlAfterRedirects
        });
      }
    });

    this.themeService.theme$.subscribe(theme => {
      if (theme) {
        this.applyTheme(theme);
      }
    });

    this.checkVotacionActiva();

    this.eventoActivoSub = this.eventosService.listenToAllEventosChanges((payload: any) => {
      this.ngZone.run(() => {
        this.checkVotacionActiva();
      });
    });
  }

  checkVotacionActiva() {
    this.eventosService.getEventoActivo().subscribe(evento => {
      if (evento) {
        this.eventoId = evento.id;
        this.mostrarMenuVotar = !!evento.votacion_activa;
        this.mostrarMenuPuntuaciones = !!evento.puntuaciones_activas;
      } else {
        this.eventoId = null;
        this.mostrarMenuVotar = false;
        this.mostrarMenuPuntuaciones = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.eventoActivoSub) {
      this.eventoActivoSub.unsubscribe();
    }
  }

  private applyTheme(theme: any) {
    const primary = theme.primary;
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--neon-green', primary);
    document.documentElement.style.setProperty('--primary-rgb', this.hexToRgb(primary));
    document.documentElement.style.setProperty('--primary-contrast', this.getContrastColor(primary));

    const secondary = theme.secondary;
    document.documentElement.style.setProperty('--secondary', secondary);

    const header = theme.header;
    document.documentElement.style.setProperty('--header-bg', header);
    document.documentElement.style.setProperty('--header-bg-rgb', this.hexToRgb(header));
    document.documentElement.style.setProperty('--header-contrast', this.getContrastColor(header));

    const bg = theme.bg;
    document.documentElement.style.setProperty('--bg', bg);
    document.documentElement.style.setProperty('--carbon-black', bg);
    document.documentElement.style.setProperty('--bg-rgb', this.hexToRgb(bg));
    document.documentElement.style.setProperty('--bg-contrast', this.getContrastColor(bg));

    const text = theme.text;
    document.documentElement.style.setProperty('--text', text);
    document.documentElement.style.setProperty('--off-white', text);
  }

  private getContrastColor(hexColor: string): string {
    if (!hexColor || typeof hexColor !== 'string') return '#1A1A1A';
    
    let hex = hexColor.replace('#', '').trim();
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }

    const hexRegex = /^[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(hex)) {
      return '#1A1A1A';
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Fórmula de luminancia estándar de la W3C (WCAG)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Si la luminancia es alta (color claro), devolvemos texto oscuro. Si es baja, texto claro.
    return (yiq >= 128) ? '#151124' : '#FFFFFF';
  }

  private hexToRgb(hex: string): string {
    if (!hex || typeof hex !== 'string') return '146, 211, 66'; // Fallback verde
    
    // Eliminar # si existe
    hex = hex.replace('#', '').trim();
    
    // Si es un hex corto de 3 caracteres, expandir a 6
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }

    // Si después de limpiar no tiene 6 caracteres o no es hex válido, devolver fallback
    const hexRegex = /^[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(hex)) {
      return '146, 211, 66'; // Fallback verde
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  async logout() {
    await this.auth.signOut();
    this.closeMenu();
  }
}

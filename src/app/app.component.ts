import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { SeoService } from './core/services/seo.service';
import { EventosService } from './core/services/eventos.service';
import { ThemeService, ThemeColors } from './core/services/theme.service';

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
  mostrarMenuQr = false;
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
        this.mostrarMenuQr = !!evento.registro_pin_abierto;
      } else {
        this.eventoId = null;
        this.mostrarMenuVotar = false;
        this.mostrarMenuPuntuaciones = false;
        this.mostrarMenuQr = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.eventoActivoSub) {
      this.eventoActivoSub.unsubscribe();
    }
  }

  private applyTheme(theme: ThemeColors) {
    if (!theme.cssVars) return;
    const root = document.documentElement;
    Object.keys(theme.cssVars).forEach(key => {
      root.style.setProperty(key, theme.cssVars![key]);
    });
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

import { Component, OnInit, OnDestroy, NgZone, HostListener } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
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
  isProfileDropdownOpen = false;
  mostrarMenuVotar = false;
  mostrarMenuPuntuaciones = false;
  mostrarMenuQr = false;
  eventoId: string | null = null;
  isStageView = false;
  isVotarView = false;
  
  private destroy$ = new Subject<void>();
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

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isProfileDropdownOpen) {
      this.isProfileDropdownOpen = false;
    }
  }

  toggleProfileDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  closeProfileDropdown(): void {
    this.isProfileDropdownOpen = false;
  }

  ngOnInit(): void {
    // Sitio dado de baja (404 Not Found / noindex).
    // No se inicializa SEO dinámico ni conexión en vivo a Supabase.
  }

  checkVotacionActiva() {
    this.eventosService.getEventoActivo().pipe(
      take(1)
    ).subscribe(evento => {
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
    this.destroy$.next();
    this.destroy$.complete();
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
    this.isProfileDropdownOpen = false;
  }

  async logout() {
    this.closeProfileDropdown();
    this.closeMenu();
    await this.auth.signOut();
  }
}

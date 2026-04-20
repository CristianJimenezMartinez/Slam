import { Component, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  title = 'slam';
  isMenuOpen = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private seo: SeoService,
    private eventosService: EventosService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Limpia JSON-LD dinámico de la página anterior
      this.seo.clearJsonLd();

      // Busca la ruta más profunda (hija) para obtener su data
      let currentRoute = this.route;
      while (currentRoute.firstChild) {
        currentRoute = currentRoute.firstChild;
      }

      const data = currentRoute.snapshot.data;

      // Si la ruta tiene datos SEO estáticos, los aplica
      if (data['seo']) {
        this.seo.setPage({
          title: data['seo'].title,
          description: data['seo'].description,
          robots: data['seo'].robots,
          path: event.urlAfterRedirects
        });
      }
    });

    // Suscripción al tema inteligente (Temporada vs Evento)
    this.themeService.theme$.subscribe(theme => {
      if (theme) {
        this.applyTheme(theme);
      }
    });
  }

  private applyTheme(theme: any) {
    const primary = theme.primary;
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--neon-green', primary);
    document.documentElement.style.setProperty('--primary-rgb', this.hexToRgb(primary));

    const secondary = theme.secondary;
    document.documentElement.style.setProperty('--secondary', secondary);

    const header = theme.header;
    document.documentElement.style.setProperty('--header-bg', header);
    document.documentElement.style.setProperty('--header-bg-rgb', this.hexToRgb(header));

    const bg = theme.bg;
    document.documentElement.style.setProperty('--bg', bg);
    document.documentElement.style.setProperty('--carbon-black', bg);
    document.documentElement.style.setProperty('--bg-rgb', this.hexToRgb(bg));

    const text = theme.text;
    document.documentElement.style.setProperty('--text', text);
    document.documentElement.style.setProperty('--off-white', text);
  }

  private hexToRgb(hex: string): string {
    // Eliminar # si existe
    hex = hex.replace('#', '');
    
    // Expandir hex corto (3 caracteres) a largo (6 caracteres)
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
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

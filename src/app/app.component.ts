import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { SeoService } from './core/services/seo.service';

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
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
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
          path: event.urlAfterRedirects
        });
      }
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

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

// Componentes
import { LandingComponent } from './features/landing/landing/landing.component';
import { CalendarComponent } from './features/landing/calendar/calendar.component';
import { CanteraComponent } from './features/landing/cantera/cantera.component';
import { NormasComponent } from './features/landing/normas/normas.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { VotarComponent } from './features/votar/votar.component';
import { PuntuacionesComponent } from './features/puntuaciones/puntuaciones.component';
import { QrComponent } from './features/qr/qr.component';
import { ResultadosComponent } from './features/resultados/resultados.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { PrintQrsComponent } from './features/admin/print-qrs/print-qrs.component';
import { CronometroComponent } from './features/cronometro/cronometro.component';
import { RuletaComponent } from './features/ruleta/ruleta.component';
import { PreviewLoadingComponent } from './features/preview-loading/preview-loading.component';
import { PreviewVotarComponent } from './features/preview-votar/preview-votar.component';
import { PreviewProyectorComponent } from './features/preview-proyector/preview-proyector.component';
import { EdicionesComponent } from './features/ediciones/ediciones.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LandingComponent,
    data: {
      seo: {
        title: 'Poetry Slam Alicante | El Escenario de la Palabra Viva',
        description: 'Circuito oficial de poesía escénica en Alicante. Veladas mensuales en el Centro Cultural Las Cigarreras, talleres de oratoria y formación en centros educativos con Ágora Reix.'
      }
    }
  },
  {
    path: 'carga',
    component: PreviewLoadingComponent,
    data: {
      seo: {
        robots: 'noindex, nofollow'
      }
    }
  },
  {
    path: 'loading',
    redirectTo: 'carga'
  },
  {
    path: 'test-votar',
    component: PreviewVotarComponent,
    data: {
      seo: {
        robots: 'noindex, nofollow'
      }
    }
  },
  {
    path: 'preview-votar',
    redirectTo: 'test-votar'
  },
  {
    path: 'test-proyector',
    component: PreviewProyectorComponent,
    data: {
      seo: {
        robots: 'noindex, nofollow'
      }
    }
  },
  {
    path: 'preview-proyector',
    redirectTo: 'test-proyector'
  },
  {
    path: 'proyector',
    redirectTo: 'puntuaciones',
    pathMatch: 'full'
  },
  {
    path: 'ruleta',
    component: RuletaComponent,
    data: {
      seo: {
        title: 'Ruleta de Nombres - Sorteo de Poetas',
        description: 'Sorteo aleatorio interactivo para determinar el orden de los poetas en el Poetry Slam Alicante.'
      }
    }
  },
  {
    path: 'cantera',
    component: CanteraComponent,
    data: {
      seo: {
        title: 'La Cantera - Talleres Escolares y Nuevas Voces | Poetry Slam Alicante',
        description: 'Talleres de oratoria, escritura poética y expresión escénica para centros educativos (ESO, Bachillerato, FP) impartidos por Ágora Reix, y cantera de nuevas voces de Poetry Slam Alicante.'
      }
    }
  },
  {
    path: 'escolar',
    redirectTo: 'cantera',
    pathMatch: 'full'
  },
  {
    path: 'talleres-escolares',
    redirectTo: 'cantera',
    pathMatch: 'full'
  },
  {
    path: 'educacion',
    redirectTo: 'cantera',
    pathMatch: 'full'
  },
  {
    path: 'normas',
    component: NormasComponent,
    data: {
      seo: {
        title: 'Reglamento Oficial | Poetry Slam Alicante',
        description: 'Consulta las reglas oficiales del Poetry Slam Alicante 2026. 3 minutos por poema, textos de autoría propia, sin atrezo ni música y jurado popular.'
      }
    }
  },
  {
    path: 'calendario',
    component: CalendarComponent,
    data: {
      seo: {
        title: 'Calendario de Eventos',
        description: 'Próximas fechas, horarios y ubicaciones de los encuentros de poesía en vivo en Alicante.'
      }
    }
  },
  {
    path: 'eventos',
    redirectTo: 'calendario'
  },
  {
    path: 'salon',
    component: EdicionesComponent,
    data: {
      seo: {
        title: 'Salón del Slam - Memoria de Ediciones',
        description: 'Crónica oficial y memoria viva de las veladas de Poetry Slam Alicante. Ganadores del Laurel de Oro, finalistas de honor, voces invitadas y cartelería histórica.'
      }
    }
  },
  {
    path: 'salon-del-slam',
    redirectTo: 'salon',
    pathMatch: 'full'
  },
  {
    path: 'ediciones',
    redirectTo: 'salon',
    pathMatch: 'full'
  },
  {
    path: 'archivo',
    redirectTo: 'salon',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [GuestGuard],
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    component: AdminDashboardComponent,
    data: {
      seo: {
        robots: 'noindex, nofollow'
      }
    }
  },
  {
    path: 'admin/imprimir-qrs/:eventoId',
    canActivate: [AuthGuard],
    component: PrintQrsComponent,
    data: {
      seo: {
        robots: 'noindex, nofollow'
      }
    }
  },
  {
    path: 'votar',
    component: VotarComponent,
    data: {
      seo: {
        title: 'Votar en el Slam',
        description: 'Participa como jurado en el próximo Slam. Tu voto decide quién gana el encuentro.'
      }
    }
  },
  {
    path: 'puntuaciones',
    component: PuntuacionesComponent,
    data: {
      seo: {
        title: 'Puntuaciones - Directo',
        description: 'Puntuaciones en directo del Poetry Slam Alicante.',
        robots: 'noindex, nofollow'
      }
    }
  },
  {
    path: 'cronometro',
    component: CronometroComponent,
    data: {
      seo: {
        title: 'Cronómetro - Control de Tiempo',
        description: 'Cronómetro oficial para medir el tiempo de los poetas en el Poetry Slam Alicante.'
      }
    }
  },
  {
    path: 'qr',
    component: QrComponent,
    data: {
      seo: {
        title: 'Escanear QR - Participar',
        description: 'Código QR para acceder a la votación interactiva.',
        robots: 'noindex, nofollow'
      }
    }
  },
  {
    path: 'resultados',
    component: ResultadosComponent,
    data: {
      seo: {
        title: 'Resultados (Privado)',
        description: 'Puntuaciones y clasificación detallada del Poetry Slam Alicante.',
        robots: 'noindex, nofollow'
      }
    }
  },
  {
    path: 'dashboard',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled',
    scrollOffset: [0, 80]
  })],
  exports: [RouterModule],
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

// Componentes
import { LandingComponent } from './features/landing/landing/landing.component';
import { HistoriaComponent } from './features/landing/historia/historia.component';
import { CanteraComponent } from './features/landing/cantera/cantera.component';
import { NormasComponent } from './features/landing/normas/normas.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { EventListComponent } from './features/admin/event-list/event-list.component';
import { EventDetailComponent } from './features/admin/event-detail/event-detail.component';
import { VotarComponent } from './features/votar/votar.component';
import { ResultadosComponent } from './features/resultados/resultados.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CronogramaListComponent } from './features/admin/cronograma-list/cronograma-list.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LandingComponent
  },
  {
    path: 'cantera',
    component: CanteraComponent,
    data: {
      seo: {
        title: 'Cantera - Nuevas Voces',
        description: 'La Cantera es el espacio para nuevas voces del Poetry Slam Alicante. Jóvenes y artistas emergentes suben al escenario por primera vez.'
      }
    }
  },
  {
    path: 'normas',
    component: NormasComponent,
    data: {
      seo: {
        title: 'Reglamento Oficial',
        description: 'Consulta las reglas oficiales del Poetry Slam Alicante 2026. Requisitos de participación, tiempo, votación pública y procedimiento.'
      }
    }
  },
  {
    path: 'calendario',
    component: HistoriaComponent,
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
    children: [
      { path: '', component: EventListComponent },
      { path: 'new', component: EventDetailComponent },
      { path: 'edit/:id', component: EventDetailComponent },
      { path: 'temporada', component: CronogramaListComponent }
    ]
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
    canActivate: [AuthGuard],
    component: DashboardComponent
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }

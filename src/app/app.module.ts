import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Landing
import { LandingComponent } from './features/landing/landing/landing.component';
import { HistoriaComponent } from './features/landing/historia/historia.component';
import { CanteraComponent } from './features/landing/cantera/cantera.component';
import { NormasComponent } from './features/landing/normas/normas.component';

// Auth
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';

// Admin
import { EventListComponent } from './features/admin/event-list/event-list.component';
import { EventDetailComponent } from './features/admin/event-detail/event-detail.component';
import { CronogramaListComponent } from './features/admin/cronograma-list/cronograma-list.component';

// Votar
import { VotarComponent } from './features/votar/votar.component';

// Otros
import { ResultadosComponent } from './features/resultados/resultados.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { FooterComponent } from './core/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    HistoriaComponent,
    CanteraComponent,
    NormasComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    EventListComponent,
    EventDetailComponent,
    CronogramaListComponent,
    VotarComponent,
    ResultadosComponent,
    DashboardComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    RouterModule,
    CoreModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }

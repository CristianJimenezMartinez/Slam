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
import { CalendarComponent } from './features/landing/calendar/calendar.component';
import { CanteraComponent } from './features/landing/cantera/cantera.component';
import { NormasComponent } from './features/landing/normas/normas.component';

// Landing Sub-components
import { HeroEventComponent } from './features/landing/landing/components/hero-event/hero-event.component';
import { HeroSeasonComponent } from './features/landing/landing/components/hero-season/hero-season.component';
import { UpcomingSliderComponent } from './features/landing/landing/components/upcoming-slider/upcoming-slider.component';
import { ParticipantsGridComponent } from './features/landing/landing/components/participants-grid/participants-grid.component';
import { UpcomingDatesComponent } from './features/landing/landing/components/upcoming-dates/upcoming-dates.component';

// Auth
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';

// Admin
import { EventListComponent } from './features/admin/event-list/event-list.component';
import { EventDetailComponent } from './features/admin/event-detail/event-detail.component';
import { CronogramaListComponent } from './features/admin/cronograma-list/cronograma-list.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';

// Admin Sub-components
import { AdminHeaderComponent } from './features/admin/admin-dashboard/components/admin-header/admin-header.component';
import { AdminTabsComponent } from './features/admin/admin-dashboard/components/admin-tabs/admin-tabs.component';

// EventDetail Sub-components
import { EventBasicInfoComponent } from './features/admin/event-detail/components/event-basic-info/event-basic-info.component';
import { EventMediaComponent } from './features/admin/event-detail/components/event-media/event-media.component';
import { EventThemeComponent } from './features/admin/event-detail/components/event-theme/event-theme.component';
import { EventParticipantsComponent } from './features/admin/event-detail/components/event-participants/event-participants.component';

// Votar
import { VotarComponent } from './features/votar/votar.component';

// Otros
import { ResultadosComponent } from './features/resultados/resultados.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { FooterComponent } from './core/footer/footer.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeEs, 'es');

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    CalendarComponent,
    CanteraComponent,
    NormasComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    EventListComponent,
    EventDetailComponent,
    CronogramaListComponent,
    AdminDashboardComponent,
    VotarComponent,
    ResultadosComponent,
    DashboardComponent,
    FooterComponent,
    ModalComponent,
    LoadingSpinnerComponent,
    HeroEventComponent,
    HeroSeasonComponent,
    UpcomingSliderComponent,
    ParticipantsGridComponent,
    UpcomingDatesComponent,
    AdminHeaderComponent,
    AdminTabsComponent,
    EventBasicInfoComponent,
    EventMediaComponent,
    EventThemeComponent,
    EventParticipantsComponent
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
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }

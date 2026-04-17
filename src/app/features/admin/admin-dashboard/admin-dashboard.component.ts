import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  activeTab: 'live' | 'eventos' | 'temporada' | 'anteriores' = 'eventos';
  isModalOpen = false;
  selectedEventId: string | null = null;
  @ViewChild('eventList') eventList: any;

  get listMode(): 'active' | 'past' {
    return this.activeTab === 'anteriores' ? 'past' : 'active';
  }

  constructor(
    public auth: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  setTab(tab: 'live' | 'eventos' | 'temporada' | 'anteriores') {
    this.activeTab = tab;
  }

  openModal(evento?: any) {
    this.selectedEventId = evento ? evento.id : null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedEventId = null;
  }

  logout() {
    this.auth.signOut();
    this.router.navigate(['/']);
  }
}

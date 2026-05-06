import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { EventosService, Evento } from '../../core/services/eventos.service';
import { Subscription } from 'rxjs';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr',
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.scss']
})
export class QrComponent implements OnInit, OnDestroy {
  evento: Evento | null = null;
  loading = true;
  qrCodeUrl: string | null = null;
  
  private eventoSub: Subscription | any = null;

  constructor(
    private eventosService: EventosService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadActiveEvent();
  }

  async loadActiveEvent() {
    this.loading = true;
    try {
      const ev = await this.eventosService.getEventoActivo().toPromise();
      this.evento = ev || null;

      if (this.evento) {
        this.updateTheme(this.evento.color_primario);
        await this.generarQR();

        // Escuchar cambios en el evento
        this.eventoSub = this.eventosService.listenToEventoChanges(this.evento.id, (payload: any) => {
          this.ngZone.run(() => {
            if (payload.new) {
              this.evento = { ...this.evento, ...payload.new } as Evento;
              this.updateTheme(this.evento.color_primario);
              this.generarQR();
            }
          });
        });
      }
    } catch (e) {
      console.error('Error cargando datos del QR:', e);
    } finally {
      this.loading = false;
    }
  }

  private updateTheme(color?: string) {
    if (!color) return;
    document.documentElement.style.setProperty('--primary', color);
    
    // También generamos el RGB para las sombras
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
  }

  async generarQR() {
    if (!this.evento) return;
    try {
      const votingUrl = `${window.location.origin}/votar?access_code=${this.evento.id}`;
      const url = await QRCode.toDataURL(votingUrl);
      this.ngZone.run(() => {
        this.qrCodeUrl = url;
      });
    } catch (e) {
      console.error('Error al generar QR:', e);
    }
  }

  ngOnDestroy(): void {
    if (this.eventoSub) this.eventoSub.unsubscribe();
  }
}

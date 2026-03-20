import { Component, OnInit } from '@angular/core';
import { EventosService } from '../../../../core/services/eventos.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  eventUrl: string = 'https://www.eventbrite.es/e/entradas-v-edicion-torneo-poetry-slam-alicante-agora-reix-escena-daci-1983952046979';
  qrCodeUrl: string | null = null;
  activo = false;

  constructor(private eventosService: EventosService) { }

  ngOnInit(): void {
    this.checkActiveEvent();
  }

  async checkActiveEvent() {
    const res = await this.eventosService.getEventoActivo().toPromise();
    if (res) {
      this.activo = true;
      const votingUrl = `${window.location.origin}/votar`;
      this.qrCodeUrl = await QRCode.toDataURL(votingUrl);
    }
  }
}

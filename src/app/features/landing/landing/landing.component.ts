import { Component, OnInit } from '@angular/core';
import { EventosService, Evento } from '../../../core/services/eventos.service';
import { ParticipantesService, Participante } from '../../../core/services/participantes.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  evento: Evento | null = null;
  participantes: Participante[] = [];
  qrCodeUrl: string | null = null;

  constructor(
    private eventosService: EventosService,
    private participantesService: ParticipantesService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    const res = await this.eventosService.getEventoActivo().toPromise();
    if (res) {
      this.evento = res;

      const partsRes = await this.participantesService.getParticipantesByEvento(this.evento.id).toPromise();
      if (partsRes?.data) {
        this.participantes = partsRes.data as Participante[];
      }

      const votingUrl = `${window.location.origin}/votar`;
      this.qrCodeUrl = await QRCode.toDataURL(votingUrl);
    }
  }
}

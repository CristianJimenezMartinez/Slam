import { Component, Input } from '@angular/core';
import { Evento } from '../../../../core/services/eventos.service';

@Component({
  selector: 'app-proyector-standby',
  templateUrl: './proyector-standby.component.html',
  styleUrls: ['./proyector-standby.component.scss']
})
export class ProyectorStandbyComponent {
  @Input() evento!: Evento;
  @Input() qrCodeUrl: string | null = null;
}

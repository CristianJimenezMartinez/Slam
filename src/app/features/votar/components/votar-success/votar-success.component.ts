import { Component, Input } from '@angular/core';
import { Participante } from '../../../../core/services/participantes.service';

@Component({
  selector: 'app-votar-success',
  templateUrl: './votar-success.component.html',
  styleUrls: ['./votar-success.component.scss']
})
export class VotarSuccessComponent {
  @Input() poetaActivo!: Participante | null;
  @Input() notaEmitida: number | null = null;
  @Input() ronda: number = 1;
}

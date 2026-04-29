import { Component, Input } from '@angular/core';
import { Participante } from '../../../../core/services/participantes.service';

@Component({
  selector: 'app-votar-success',
  templateUrl: './votar-success.component.html'
})
export class VotarSuccessComponent {
  @Input() poetaActivo!: Participante | null;
}

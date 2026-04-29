import { Component, Input } from '@angular/core';
import { Evento } from '../../../../core/services/eventos.service';
import { Participante } from '../../../../core/services/participantes.service';

@Component({
  selector: 'app-votar-standby',
  templateUrl: './votar-standby.component.html'
})
export class VotarStandbyComponent {
  @Input() evento!: Evento | null;
  @Input() poetaActivo!: Participante | null;
}

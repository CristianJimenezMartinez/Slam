import { Component, Input } from '@angular/core';
import { Evento } from '../../../../core/services/eventos.service';

@Component({
  selector: 'app-votar-lock',
  templateUrl: './votar-lock.component.html'
})
export class VotarLockComponent {
  @Input() evento!: Evento | null;
}

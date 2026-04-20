import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-participants-grid',
  templateUrl: './participants-grid.component.html',
  styleUrls: ['./participants-grid.component.scss']
})
export class ParticipantsGridComponent {
  @Input() participantes: any[] = [];
}

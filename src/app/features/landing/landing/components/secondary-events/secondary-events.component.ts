import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-secondary-events',
  templateUrl: './secondary-events.component.html',
  styleUrls: ['./secondary-events.component.scss']
})
export class SecondaryEventsComponent {
  @Input() eventos: any[] = [];
}

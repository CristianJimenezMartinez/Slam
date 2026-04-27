import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-upcoming-dates',
  templateUrl: './upcoming-dates.component.html',
  styleUrls: ['./upcoming-dates.component.scss']
})
export class UpcomingDatesComponent {
  @Input() eventos: any[] = [];
}

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-upcoming-slider',
  templateUrl: './upcoming-slider.component.html',
  styleUrls: ['./upcoming-slider.component.scss']
})
export class UpcomingSliderComponent {
  @Input() eventos: any[] = [];
  @Input() fotoTemporada: string | null = null;
}

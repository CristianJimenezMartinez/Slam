import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-event',
  templateUrl: './hero-event.component.html',
  styleUrls: ['./hero-event.component.scss']
})
export class HeroEventComponent {
  @Input() evento: any;
}

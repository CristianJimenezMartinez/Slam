import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-hero-season',
  templateUrl: './hero-season.component.html',
  styleUrls: ['./hero-season.component.scss']
})
export class HeroSeasonComponent {
  @Input() edicionTexto: string = '';
  @Input() currentYear: number = new Date().getFullYear();
  @Input() urlPaseTemporada: string | null = null;
  @Input() fotoTemporada: string | null = null;

  @Output() scrollRequest = new EventEmitter<void>();

  onScrollClick() {
    this.scrollRequest.emit();
  }
}

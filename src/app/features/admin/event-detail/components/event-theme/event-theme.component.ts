import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-event-theme',
  templateUrl: './event-theme.component.html'
})
export class EventThemeComponent {
  @Input() parentForm!: FormGroup;
}

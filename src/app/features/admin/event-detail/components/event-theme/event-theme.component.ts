import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-event-theme',
  templateUrl: './event-theme.component.html',
  styleUrls: ['./event-theme.component.scss']
})
export class EventThemeComponent {
  @Input() parentForm!: FormGroup;
}

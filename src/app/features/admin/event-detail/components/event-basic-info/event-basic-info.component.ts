import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-event-basic-info',
  templateUrl: './event-basic-info.component.html'
})
export class EventBasicInfoComponent {
  @Input() parentForm!: FormGroup;
}

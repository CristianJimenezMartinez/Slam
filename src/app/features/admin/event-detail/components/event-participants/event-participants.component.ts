import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-event-participants',
  templateUrl: './event-participants.component.html'
})
export class EventParticipantsComponent {
  @Input() parentForm!: FormGroup;
  
  @Output() add = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();

  get participantes(): FormArray {
    return this.parentForm.get('participantes') as FormArray;
  }

  onAdd() {
    this.add.emit();
  }

  onRemove(index: number) {
    this.remove.emit(index);
  }
}

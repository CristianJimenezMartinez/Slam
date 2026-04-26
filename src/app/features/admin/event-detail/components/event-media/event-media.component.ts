import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-event-media',
  templateUrl: './event-media.component.html',
  styleUrls: ['./event-media.component.scss']
})
export class EventMediaComponent {
  @Input() cartelPreview: string | null = null;
  @Input() existingCarteles: any[] = [];
  
  @Output() fileSelected = new EventEmitter<any>();
  @Output() removeCartel = new EventEmitter<void>();
  @Output() selectExisting = new EventEmitter<string>();

  onFileSelected(event: any) {
    this.fileSelected.emit(event);
  }

  onRemoveCartel() {
    this.removeCartel.emit();
  }

  onSelectExisting(url: string) {
    this.selectExisting.emit(url);
  }
}

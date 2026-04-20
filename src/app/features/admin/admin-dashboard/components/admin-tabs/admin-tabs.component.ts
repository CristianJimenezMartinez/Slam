import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-admin-tabs',
  templateUrl: './admin-tabs.component.html',
  styleUrls: ['./admin-tabs.component.scss']
})
export class AdminTabsComponent {
  @Input() activeTab: string = 'eventos';
  @Output() tabChange = new EventEmitter<any>();
  @Output() newEvent = new EventEmitter<void>();

  setTab(tab: string) {
    this.tabChange.emit(tab);
  }

  onNewEvent() {
    this.newEvent.emit();
  }
}

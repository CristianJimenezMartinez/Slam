import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TimerPhase } from '../../models/cronometro.models';

@Component({
  selector: 'app-cronometro-controls',
  templateUrl: './cronometro-controls.component.html',
  styleUrl: './cronometro-controls.component.scss'
})
export class CronometroControlsComponent {
  @Input() timerRunning = false;
  @Input() elapsedMs = 0;
  @Input() currentPhase: TimerPhase = 'idle';
  @Input() isFullscreen = false;

  @Output() toggle = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() adjustSeconds = new EventEmitter<number>();

  onToggle(): void {
    this.toggle.emit();
  }

  onReset(): void {
    this.reset.emit();
  }

  onAdjustSeconds(seconds: number): void {
    this.adjustSeconds.emit(seconds);
  }
}

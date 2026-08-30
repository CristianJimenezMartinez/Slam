import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TimerMode, TimerPreset } from '../../models/cronometro.models';

@Component({
  selector: 'app-cronometro-header',
  templateUrl: './cronometro-header.component.html',
  styleUrl: './cronometro-header.component.scss'
})
export class CronometroHeaderComponent {
  @Input() timerRunning = false;
  @Input() timerMode: TimerMode = 'countup';
  @Input() soundEnabled = true;
  @Input() isFullscreen = false;
  @Input() presets: TimerPreset[] = [];
  @Input() activePreset!: TimerPreset;

  @Output() modeChange = new EventEmitter<TimerMode>();
  @Output() soundToggle = new EventEmitter<void>();
  @Output() fullscreenToggle = new EventEmitter<void>();
  @Output() presetSelect = new EventEmitter<TimerPreset>();

  onToggleMode(): void {
    const nextMode: TimerMode = this.timerMode === 'countup' ? 'countdown' : 'countup';
    this.modeChange.emit(nextMode);
  }

  onToggleSound(): void {
    this.soundToggle.emit();
  }

  onToggleFullscreen(): void {
    this.fullscreenToggle.emit();
  }

  onSelectPreset(preset: TimerPreset): void {
    this.presetSelect.emit(preset);
  }
}

import { Component, Input } from '@angular/core';
import { TimerMode, TimerPhase } from '../../models/cronometro.models';

@Component({
  selector: 'app-cronometro-dial',
  templateUrl: './cronometro-dial.component.html',
  styleUrl: './cronometro-dial.component.scss'
})
export class CronometroDialComponent {
  @Input() currentPhase: TimerPhase = 'idle';
  @Input() phaseText = 'LISTO';
  @Input() minutesDisplay = '00';
  @Input() secondsDisplay = '00';
  @Input() decimasDisplay = '0';
  @Input() penaltyPoints = 0;
  @Input() timerMode: TimerMode = 'countup';
  @Input() activePresetName = '3 Min Oficial';
  @Input() circleRadius = 160;
  @Input() circleCircumference = 1005.3;
  @Input() dashOffset = 1005.3;
  @Input() isFullscreen = false;
}

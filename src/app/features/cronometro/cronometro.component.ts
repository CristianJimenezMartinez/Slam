import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { TimerPhase, TimerMode, TimerPreset, DEFAULT_PRESETS } from './models/cronometro.models';
import { CronometroSoundService } from './services/cronometro-sound.service';

// Componente Principal Cronómetro de Escenario
@Component({
  selector: 'app-cronometro',
  templateUrl: './cronometro.component.html',
  styleUrl: './cronometro.component.scss'
})
export class CronometroComponent implements OnInit, OnDestroy {
  @ViewChild('cronometroRoot', { static: true }) cronometroRoot!: ElementRef<HTMLElement>;

  readonly PRESETS: TimerPreset[] = DEFAULT_PRESETS;
  activePreset: TimerPreset = this.PRESETS[0];
  timerMode: TimerMode = 'countup';

  // Estado del tiempo
  timerRunning = false;
  elapsedMs = 0;
  private startTime = 0;
  private animFrameId: number | null = null;

  // Visuales y Fases
  currentPhase: TimerPhase = 'idle';
  phaseText = 'LISTO';
  penaltyPoints = 0;
  progressPercent = 0;

  // Strings para el display
  minutesDisplay = '00';
  secondsDisplay = '00';
  decimasDisplay = '0';

  // Configuración de audio y visual
  soundEnabled = true;
  isFullscreen = false;
  private playedBeeps = new Set<string>();

  // SVG Radial Gauge Configuration
  readonly circleRadius = 160;
  readonly circleCircumference = 2 * Math.PI * 160; // ~1005.3
  dashOffset = this.circleCircumference;

  constructor(private soundService: CronometroSoundService) {}

  ngOnInit(): void {
    this.updateDisplayValues();
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
  }

  ngOnDestroy(): void {
    this.stopTimer();
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    this.soundService.destroy();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    if (event.code === 'Space') {
      event.preventDefault();
      this.toggleTimer();
    } else if (event.code === 'KeyR') {
      event.preventDefault();
      this.resetTimer();
    } else if (event.code === 'KeyF') {
      event.preventDefault();
      this.toggleFullscreen();
    } else if (event.code === 'KeyM') {
      event.preventDefault();
      this.toggleSound();
    }
  }

  // CONTROLES DE CRONÓMETRO
  toggleTimer(): void {
    if (this.timerRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer(): void {
    if (this.timerRunning) return;
    this.timerRunning = true;
    this.startTime = performance.now() - this.elapsedMs;
    this.soundService.playChime('start', this.soundEnabled);
    this.loop();
  }

  pauseTimer(): void {
    this.timerRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  stopTimer(): void {
    this.pauseTimer();
  }

  resetTimer(): void {
    this.pauseTimer();
    this.elapsedMs = 0;
    this.playedBeeps.clear();
    this.currentPhase = 'idle';
    this.phaseText = 'LISTO';
    this.penaltyPoints = 0;
    this.progressPercent = 0;
    this.dashOffset = this.circleCircumference;
    this.updateDisplayValues();
  }

  addSeconds(seconds: number): void {
    const deltaMs = seconds * 1000;
    this.elapsedMs = Math.max(0, this.elapsedMs + deltaMs);
    if (this.timerRunning) {
      this.startTime = performance.now() - this.elapsedMs;
    }
    this.updatePhaseAndProgress();
    this.updateDisplayValues();
  }

  selectPreset(preset: TimerPreset): void {
    this.activePreset = preset;
    this.resetTimer();
  }

  setMode(mode: TimerMode): void {
    this.timerMode = mode;
    this.updateDisplayValues();
  }

  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
  }

  // LOOP PRINCIPAL DE TIEMPO
  private loop(): void {
    if (!this.timerRunning) return;

    this.elapsedMs = performance.now() - this.startTime;
    this.updatePhaseAndProgress();
    this.updateDisplayValues();
    this.checkAudioTriggers();

    this.animFrameId = requestAnimationFrame(() => this.loop());
  }

  // CÁLCULO DE FASES Y RADIAL
  private updatePhaseAndProgress(): void {
    const targetMs = this.activePreset.targetSeconds * 1000;
    const graceMs = (this.activePreset.targetSeconds + this.activePreset.graceSeconds) * 1000;
    const elapsedSec = this.elapsedMs / 1000;

    this.progressPercent = Math.min(100, (this.elapsedMs / targetMs) * 100);
    const progressFraction = Math.min(1, this.elapsedMs / targetMs);
    this.dashOffset = this.circleCircumference * (1 - progressFraction);

    if (this.elapsedMs === 0) {
      this.currentPhase = 'idle';
      this.phaseText = 'LISTO';
      this.penaltyPoints = 0;
    } else if (this.elapsedMs < targetMs - 60000) {
      this.currentPhase = 'normal';
      this.phaseText = 'EN CURSO';
      this.penaltyPoints = 0;
    } else if (this.elapsedMs < targetMs - 30000) {
      this.currentPhase = 'warning';
      this.phaseText = 'ÚLTIMO MIN';
      this.penaltyPoints = 0;
    } else if (this.elapsedMs < targetMs) {
      this.currentPhase = 'alert';
      this.phaseText = 'RECTA FINAL';
      this.penaltyPoints = 0;
    } else if (this.elapsedMs <= graceMs) {
      this.currentPhase = 'grace';
      const remainingGrace = Math.ceil((graceMs - this.elapsedMs) / 1000);
      this.phaseText = `CORTESÍA ${remainingGrace}s`;
      this.penaltyPoints = 0;
    } else {
      this.currentPhase = 'overtime';
      const overtimeSec = elapsedSec - (this.activePreset.targetSeconds + this.activePreset.graceSeconds);
      this.penaltyPoints = Math.ceil(overtimeSec / 10) * 0.5;
      this.phaseText = 'EXCEDIDO';
    }
  }

  private updateDisplayValues(): void {
    let displayMs = this.elapsedMs;

    if (this.timerMode === 'countdown') {
      const targetMs = this.activePreset.targetSeconds * 1000;
      displayMs = Math.max(0, targetMs - this.elapsedMs);
    }

    const totalSeconds = Math.floor(displayMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const decimas = Math.floor((displayMs % 1000) / 100);

    this.minutesDisplay = minutes.toString().padStart(2, '0');
    this.secondsDisplay = seconds.toString().padStart(2, '0');
    this.decimasDisplay = decimas.toString();
  }

  private checkAudioTriggers(): void {
    if (!this.soundEnabled) return;

    const targetSec = this.activePreset.targetSeconds;
    const elapsedSec = Math.floor(this.elapsedMs / 1000);

    if (targetSec >= 180 && elapsedSec === targetSec - 60 && !this.playedBeeps.has('2m')) {
      this.playedBeeps.add('2m');
      this.soundService.playChime('warn-2m', this.soundEnabled);
    }

    if (elapsedSec === targetSec - 30 && !this.playedBeeps.has('30s')) {
      this.playedBeeps.add('30s');
      this.soundService.playChime('warn-30s', this.soundEnabled);
    }

    if (elapsedSec === targetSec && !this.playedBeeps.has('end')) {
      this.playedBeeps.add('end');
      this.soundService.playChime('end', this.soundEnabled);
    }

    if (elapsedSec === targetSec + this.activePreset.graceSeconds && !this.playedBeeps.has('overtime')) {
      this.playedBeeps.add('overtime');
      this.soundService.playChime('overtime', this.soundEnabled);
    }
  }

  // PANTALLA COMPLETA / MODO ESCENARIO
  toggleFullscreen(): void {
    const elem = this.cronometroRoot?.nativeElement || document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  private onFullscreenChange(): void {
    this.isFullscreen = !!document.fullscreenElement;
  }
}

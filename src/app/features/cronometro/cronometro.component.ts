import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-cronometro',
  templateUrl: './cronometro.component.html',
  styleUrl: './cronometro.component.scss'
})
export class CronometroComponent implements OnDestroy {
  timerDisplay = '00:00.0';
  private timerCentiseconds = 0;
  private timerInterval: any;
  timerRunning = false;

  toggleTimer() {
    if (this.timerRunning) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.timerRunning = true;
    this.timerInterval = setInterval(() => {
      this.timerCentiseconds += 1;
      this.updateTimerDisplay();
    }, 100); // Actualizar cada 100ms para mostrar decimas
  }

  stopTimer() {
    this.timerRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  resetTimer() {
    this.stopTimer();
    this.timerCentiseconds = 0;
    this.updateTimerDisplay();
  }

  private updateTimerDisplay() {
    const totalSeconds = Math.floor(this.timerCentiseconds / 10);
    const decimas = this.timerCentiseconds % 10;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    this.timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${decimas}`;
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-container" [class.full-screen]="fullScreen">
      <div class="spinner"></div>
      <p>Preparando el escenario...</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      width: 100%;
      box-sizing: border-box;
      
      &.full-screen {
        height: 100vh;
        background: var(--bg);
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
      }
    }

    .spinner {
      border: 4px solid rgba(var(--primary-rgb), 0.1);
      border-top-color: var(--primary);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin-bottom: 2rem;
    }

    p {
      font-family: 'Bebas Neue', cursive;
      font-size: 1.5rem;
      letter-spacing: 2px;
      color: rgba(var(--text-rgb, 255, 255, 255), 0.4);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() fullScreen = false;
}

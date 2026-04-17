import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <h2>{{ title }}</h2>
          <button class="btn-close" (click)="close.emit()">✕</button>
        </header>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-container {
      background: #111;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      width: 90%;
      max-width: 900px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);
      animation: slideUp 0.3s ease-out;
    }

    .modal-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-family: 'Bebas Neue', cursive;
        color: var(--neon-green);
        font-size: 1.8rem;
        letter-spacing: 1px;
      }

      .btn-close {
        background: transparent;
        border: none;
        color: #666;
        font-size: 1.5rem;
        cursor: pointer;
        transition: color 0.2s;
        &:hover { color: white; }
      }
    }

    .modal-body {
      padding: 2rem;
      overflow-y: auto;
      flex: 1;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ModalComponent {
  @Input() title: string = '';
  @Output() close = new EventEmitter<void>();
}

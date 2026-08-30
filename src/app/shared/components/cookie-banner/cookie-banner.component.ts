import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cookie-banner',
  template: `
    <div class="cookie-banner-wrapper" *ngIf="showBanner" [class.closing]="isClosing">
      <div class="cookie-card glass">
        <div class="cookie-header">
          <div class="cookie-icon-frame">
            <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z"/>
              <path d="M8.5 8.5v.01"/>
              <path d="M7 13.5v.01"/>
              <path d="M11 16v.01"/>
              <path d="M15 13v.01"/>
            </svg>
          </div>
          <div class="cookie-title-group">
            <span class="cookie-badge">PRIVACIDAD & COOKIES</span>
            <h3 class="cookie-title">Versos Libres, Datos Protegidos</h3>
          </div>
        </div>

        <p class="cookie-desc">
          Utilizamos cookies esenciales para el correcto funcionamiento del torneo y cookies analíticas anónimas para medir la difusión cultural de nuestras veladas. Respetamos tu privacidad y nunca comercializamos tus datos.
        </p>

        <div class="cookie-actions">
          <button (click)="acceptAll()" class="btn-primary">
            <span>Aceptar todas</span>
          </button>
          <button (click)="acceptEssential()" class="btn-secondary">
            <span>Solo esenciales</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cookie-banner-wrapper {
      position: fixed;
      bottom: 1.8rem;
      right: 1.8rem;
      z-index: 99990;
      max-width: 460px;
      width: calc(100vw - 3.6rem);
      animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      pointer-events: none;

      &.closing {
        animation: fadeOutDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    }

    .cookie-card {
      pointer-events: auto;
      background: rgba(14, 18, 23, 0.92);
      backdrop-filter: blur(25px) saturate(180%);
      -webkit-backdrop-filter: blur(25px) saturate(180%);
      border: 1.5px solid rgba(18, 209, 174, 0.35);
      border-radius: 24px;
      padding: 1.8rem;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(18, 209, 174, 0.15);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--secondary), var(--primary), transparent);
        box-shadow: 0 0 10px var(--secondary);
      }
    }

    .cookie-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .cookie-icon-frame {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      background: rgba(var(--secondary-rgb), 0.1);
      border: 1.5px solid rgba(var(--secondary-rgb), 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 0 15px rgba(var(--secondary-rgb), 0.2);

      .svg-icon {
        width: 24px;
        height: 24px;
        stroke: var(--secondary);
      }
    }

    .cookie-title-group {
      display: flex;
      flex-direction: column;
    }

    .cookie-badge {
      font-family: var(--font-condensed);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--secondary);
      margin-bottom: 0.2rem;
    }

    .cookie-title {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      line-height: 1.2;
    }

    .cookie-desc {
      font-family: var(--font-body);
      font-size: 0.92rem;
      color: #94a3b8;
      line-height: 1.55;
      margin: 0 0 1.4rem 0;
    }

    .cookie-actions {
      display: flex;
      gap: 0.8rem;
      align-items: center;

      button {
        flex: 1;
        padding: 0.7rem 1.2rem;
        font-size: 0.95rem;
        letter-spacing: 1.5px;
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes fadeOutDown {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
    }

    @media (max-width: 600px) {
      .cookie-banner-wrapper {
        bottom: 1rem;
        right: 1rem;
        left: 1rem;
        width: auto;
      }

      .cookie-card {
        padding: 1.4rem;
      }

      .cookie-actions {
        flex-direction: column;
        
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class CookieBannerComponent implements OnInit {
  showBanner = false;
  isClosing = false;
  private readonly STORAGE_KEY = 'slam_cookie_consent';

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(this.STORAGE_KEY);
      if (!consent) {
        // Small delay for smooth entrance
        setTimeout(() => {
          this.showBanner = true;
        }, 1200);
      }
    }
  }

  acceptAll(): void {
    this.saveConsent('all');
  }

  acceptEssential(): void {
    this.saveConsent('essential');
  }

  private saveConsent(type: 'all' | 'essential'): void {
    this.isClosing = true;
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
          type,
          timestamp: new Date().toISOString()
        }));
      }
      this.showBanner = false;
      this.isClosing = false;
    }, 300);
  }
}

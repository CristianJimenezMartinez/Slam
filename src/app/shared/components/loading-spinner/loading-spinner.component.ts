import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="loader-backdrop" [class.full-screen]="fullScreen">
      <!-- FONDO CINEMATOGRÁFICO FIJO -->
      <div class="loader-bg-img" *ngIf="fullScreen"></div>
      <div class="loader-overlay" *ngIf="fullScreen"></div>

      <!-- TARJETA DE CRISTAL POÉTICA -->
      <div class="loader-card glass">
        <!-- PLUMA POÉTICA ILUMINADA -->
        <div class="quill-wrapper">
          <div class="quill-glow"></div>
          <svg class="quill-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="quillGrad" x1="20" y1="85" x2="78" y2="12" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#12D1AE" stop-opacity="0.2"/>
                <stop offset="60%" stop-color="#7AE92B" stop-opacity="0.45"/>
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0.75"/>
              </linearGradient>
              <linearGradient id="quillStroke" x1="20" y1="85" x2="78" y2="12" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#12D1AE"/>
                <stop offset="50%" stop-color="#7AE92B"/>
                <stop offset="100%" stop-color="#ffffff"/>
              </linearGradient>
              <linearGradient id="quillSpine" x1="14" y1="90" x2="80" y2="10" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#7AE92B"/>
                <stop offset="100%" stop-color="#ffffff"/>
              </linearGradient>
            </defs>
            
            <!-- Vane / Barbs of the feather -->
            <path d="M78 12C78 12 85 28 68 46C55 60 38 72 20 85C20 85 36 78 48 66C60 54 70 38 78 12Z" 
                  fill="url(#quillGrad)" 
                  stroke="url(#quillStroke)" 
                  stroke-width="1.8" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"/>
            <!-- Shaft / Calamus -->
            <path d="M80 10C65 35 45 60 16 88L14 90" 
                  stroke="url(#quillSpine)" 
                  stroke-width="2.4" 
                  stroke-linecap="round"/>
            <!-- Feather texture cuts -->
            <path d="M68 28C60 33 55 35 48 38" stroke="rgba(18, 209, 174, 0.5)" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M58 40C50 45 44 47 38 50" stroke="rgba(18, 209, 174, 0.5)" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M46 54C40 58 35 60 30 63" stroke="rgba(18, 209, 174, 0.5)" stroke-width="1.2" stroke-linecap="round"/>
            <!-- Glowing Writing Nib Tip -->
            <circle cx="14" cy="90" r="3" fill="#7AE92B" class="quill-nib-sparkle"/>
            <circle cx="14" cy="90" r="8" fill="#7AE92B" opacity="0.35" class="quill-nib-halo"/>
          </svg>
          
          <div class="ink-pulse-trail">
            <span class="ink-wave"></span>
          </div>
        </div>

        <!-- TEXTOS POÉTICOS -->
        <div class="loader-texts">
          <div class="loader-badge">POETRY SLAM ALICANTE</div>
          <h2 class="loader-title">ENCENDIENDO EL ESCENARIO</h2>
          <p class="loader-subtitle">«Donde la palabra se hace cuerpo y la emoción encuentra su eco»</p>
        </div>

        <!-- BARRA LÁSER DE PROGRESO SUAVE -->
        <div class="loader-progress-track">
          <div class="loader-progress-bar"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loader-backdrop {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      width: 100%;
      box-sizing: border-box;
      position: relative;
      
      &.full-screen {
        height: 100vh;
        width: 100vw;
        background: #0E1217;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 99999;
        overflow: hidden;
      }
    }

    .loader-bg-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url('/assets/images/calendar_hero.jpg');
      background-size: cover;
      background-position: center;
      filter: blur(8px) brightness(0.4) contrast(1.2);
      transform: scale(1.05);
      z-index: 1;
    }

    .loader-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 50% 45%, rgba(14, 18, 23, 0.6) 0%, rgba(14, 18, 23, 0.95) 100%);
      z-index: 2;
    }

    .loader-card {
      position: relative;
      z-index: 10;
      max-width: 520px;
      width: 100%;
      background: rgba(14, 18, 23, 0.78);
      backdrop-filter: blur(25px) saturate(180%);
      -webkit-backdrop-filter: blur(25px) saturate(180%);
      border: 1px solid rgba(18, 209, 174, 0.3);
      border-radius: 28px;
      padding: 3.2rem 2.8rem 2.8rem;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.85), 0 0 45px rgba(18, 209, 174, 0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      animation: cardAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* PLUMA POÉTICA */
    .quill-wrapper {
      position: relative;
      width: 90px;
      height: 90px;
      margin-bottom: 1.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .quill-glow {
      position: absolute;
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, rgba(122, 233, 43, 0.35) 0%, rgba(18, 209, 174, 0.25) 50%, transparent 70%);
      filter: blur(20px);
      border-radius: 50%;
      animation: pulseAura 2.2s infinite alternate ease-in-out;
    }

    .quill-svg {
      width: 85px;
      height: 85px;
      filter: drop-shadow(0 0 12px rgba(122, 233, 43, 0.6));
      animation: floatQuill 3s infinite ease-in-out;
    }

    .quill-nib-sparkle {
      animation: sparkleGlow 1.5s infinite alternate ease-in-out;
    }

    .quill-nib-halo {
      animation: haloExpand 1.5s infinite alternate ease-in-out;
    }

    .ink-pulse-trail {
      position: absolute;
      bottom: 2px;
      left: 10px;
      width: 25px;
      height: 6px;
      
      .ink-wave {
        display: block;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, #7AE92B, #12D1AE, transparent);
        border-radius: 2px;
        box-shadow: 0 0 10px #7AE92B;
        animation: inkFlow 2s infinite ease-in-out;
      }
    }

    /* TEXTOS */
    .loader-texts {
      margin-bottom: 2rem;

      .loader-badge {
        display: inline-block;
        font-family: var(--font-condensed);
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: var(--secondary);
        background: rgba(var(--secondary-rgb), 0.1);
        border: 1px solid rgba(var(--secondary-rgb), 0.35);
        padding: 0.35rem 1.2rem;
        border-radius: 9999px;
        margin-bottom: 1rem;
      }

      .loader-title {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 2rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        background: linear-gradient(135deg, #ffffff 0%, #d8fced 40%, var(--primary) 70%, var(--secondary) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px rgba(var(--primary-rgb), 0.35);
        margin: 0 0 0.8rem 0;
        line-height: 1.15;
      }

      .loader-subtitle {
        font-family: var(--font-condensed);
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 2.5px;
        text-transform: uppercase;
        color: var(--secondary);
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8), 0 0 15px rgba(var(--secondary-rgb), 0.25);
        margin: 0;
        line-height: 1.5;
      }
    }

    /* BARRA DE PROGRESO LÁSER */
    .loader-progress-track {
      width: 100%;
      max-width: 320px;
      height: 4px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
      position: relative;

      .loader-progress-bar {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, var(--secondary), var(--primary), transparent);
        box-shadow: 0 0 15px var(--primary);
        border-radius: 9999px;
        animation: laserScan 1.8s infinite cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    /* ANIMACIONES */
    @keyframes cardAppear {
      from { opacity: 0; transform: scale(0.92) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    @keyframes floatQuill {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(-3deg); }
    }

    @keyframes pulseAura {
      0% { transform: scale(0.9); opacity: 0.4; }
      100% { transform: scale(1.2); opacity: 0.8; }
    }

    @keyframes sparkleGlow {
      0% { opacity: 0.6; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1.3); }
    }

    @keyframes haloExpand {
      0% { transform: scale(0.8); opacity: 0.2; }
      100% { transform: scale(1.4); opacity: 0.5; }
    }

    @keyframes laserScan {
      0% { left: -100%; }
      100% { left: 100%; }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() fullScreen = false;
}

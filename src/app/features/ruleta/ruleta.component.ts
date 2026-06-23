import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { EventosService, Evento } from '../../core/services/eventos.service';
import { ParticipantesService } from '../../core/services/participantes.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ruleta',
  templateUrl: './ruleta.component.html',
  styleUrl: './ruleta.component.scss'
})
export class RuletaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('wheelCanvas', { static: false }) wheelCanvas!: ElementRef<HTMLCanvasElement>;

  // Lista de nombres en la ruleta
  nombres: string[] = [
    'Andrea', 'Carlos', 'Elvira', 'Héctor', 'Laura', 'Marcos', 'Nerea', 'Pablo'
  ];
  
  // Entrada de texto de la lista de participantes (se sincroniza con "nombres")
  listaTexto: string = '';

  // Mapa de colores por poeta (nombre -> color hex) basado en los colores del evento
  coloresPoetas: { [nombre: string]: string } = {};

  // Estado del giro
  isSpinning: boolean = false;
  private angle: number = 0;
  private angularVelocity: number = 0;
  private friction: number = 0.88; // Desaceleración muy rápida (casi instantánea)
  private lastSectorIndex: number = -1;

  // Ganador actual
  ganador: string | null = null;
  showWinnerModal: boolean = false;

  // Evento activo en Supabase
  eventoActivo: Evento | null = null;
  loadingEvent: boolean = false;
  private subEvent: Subscription | null = null;

  // Web Audio API para efectos analógicos
  private audioCtx: AudioContext | null = null;

  // Animación del Canvas (Confeti)
  private particles: Array<{
    x: number;
    y: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
  }> = [];
  private confettiActive: boolean = false;
  private animationFrameId: number | null = null;

  constructor(
    private eventosService: EventosService,
    private participantesService: ParticipantesService
  ) {}

  ngOnInit(): void {
    this.sincronizarTextoDesdeNombres();
    this.obtenerEventoActivo();
  }

  ngAfterViewInit(): void {
    this.ajustarCanvas();
    this.iniciarBucleRender();
  }

  ngOnDestroy(): void {
    if (this.subEvent) {
      this.subEvent.unsubscribe();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.audioCtx) {
      this.audioCtx.close();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.ajustarCanvas();
  }

  private ajustarCanvas(): void {
    if (!this.wheelCanvas) return;
    const canvas = this.wheelCanvas.nativeElement;
    const container = canvas.parentElement;
    if (container) {
      const width = Math.min(container.clientWidth, 400);
      const height = width * 1.33; // Relación de aspecto 3:4 (candado de bici)
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
  }

  private obtenerEventoActivo(): void {
    this.loadingEvent = true;
    this.subEvent = this.eventosService.getEventoActivo().subscribe({
      next: (evento) => {
        this.eventoActivo = evento;
        this.loadingEvent = false;
      },
      error: () => {
        this.loadingEvent = false;
      }
    });
  }

  cargarPoetasDelEvento(): void {
    if (!this.eventoActivo) return;
    this.loadingEvent = true;
    this.participantesService.getParticipantesByEvento(this.eventoActivo.id).subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          // Filtrar para excluir al poeta de demostración (orden === 0)
          const poetasCompetidores = res.data.filter((p: any) => p.orden > 0);
          if (poetasCompetidores.length > 0) {
            this.nombres = poetasCompetidores.map((p: any) => p.nombre);

            // Generar paleta de colores basada en los colores del evento
            const primario = this.eventoActivo!.color_primario || '#92D342';
            const secundario = this.eventoActivo!.color_secundario || '#368475';
            this.generarPaletaPoetas(poetasCompetidores, primario, secundario);

            this.sincronizarTextoDesdeNombres();
            this.resetearRuleta();
          } else {
            alert('No se encontraron poetas competidores (orden > 0) para este evento.');
          }
        } else {
          alert('No se encontraron participantes registrados en este evento.');
        }
        this.loadingEvent = false;
      },
      error: () => {
        alert('Error al cargar los participantes.');
        this.loadingEvent = false;
      }
    });
  }

  /**
   * Genera una paleta de colores para cada poeta interpolando
   * entre color_primario y color_secundario del evento.
   * Cada poeta recibe un color único derivado de la temática del evento.
   */
  private generarPaletaPoetas(poetas: any[], primario: string, secundario: string): void {
    this.coloresPoetas = {};
    const hslPrimario = this.hexToHsl(primario);
    const hslSecundario = this.hexToHsl(secundario);
    const total = poetas.length;

    poetas.forEach((p: any, index: number) => {
      const t = total > 1 ? index / (total - 1) : 0;
      // Interpolar en el espacio HSL entre primario y secundario
      const h = hslPrimario.h + (hslSecundario.h - hslPrimario.h) * t;
      const s = hslPrimario.s + (hslSecundario.s - hslPrimario.s) * t;
      // Luminosidad fija alta para que se vean bien sobre fondo oscuro
      const l = 60 + (t * 10); // Entre 60% y 70% para buena visibilidad
      this.coloresPoetas[p.nombre] = this.hslToHex(h, s, l);
    });
  }

  /** Convierte un color HEX (#RRGGBB) a HSL {h, s, l} */
  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  /** Convierte HSL a HEX (#RRGGBB) */
  private hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  /** Devuelve el color asignado al poeta por su nombre, o un gris por defecto */
  getColorPoeta(nombre: string): string {
    return this.coloresPoetas[nombre] || '#a0a0a0';
  }

  /** Convierte un color HEX a {r, g, b} para usar en rgba() */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }

  // Sincronizar el text-area con el array de nombres
  private sincronizarTextoDesdeNombres(): void {
    this.listaTexto = this.nombres.join('\n');
  }

  // Sincronizar el array de nombres con el text-area
  actualizarNombresDesdeTexto(): void {
    this.nombres = this.listaTexto
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    this.resetearRuleta();
  }

  resetearRuleta(): void {
    this.angle = 0;
    this.angularVelocity = 0;
    this.isSpinning = false;
    this.lastSectorIndex = -1;
    this.showWinnerModal = false;
    this.ganador = null;
    this.confettiActive = false;
    this.particles = [];
  }

  mezclarNombres(): void {
    if (this.isSpinning) return;
    // Fisher-Yates shuffle
    for (let i = this.nombres.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.nombres[i], this.nombres[j]] = [this.nombres[j], this.nombres[i]];
    }
    this.sincronizarTextoDesdeNombres();
    this.resetearRuleta();
  }

  limpiarRuleta(): void {
    if (this.isSpinning) return;
    this.nombres = [];
    this.sincronizarTextoDesdeNombres();
    this.resetearRuleta();
  }

  girar(): void {
    if (this.isSpinning || this.nombres.length === 0) return;

    this.initAudioContext();
    this.isSpinning = true;
    this.showWinnerModal = false;
    this.confettiActive = false;
    this.particles = [];
    this.ganador = null;

    // Velocidad de giro inicial reducida para giro casi instantáneo
    this.angularVelocity = 1.2 + Math.random() * 0.8;
  }

  private initAudioContext(): void {
    if (!this.audioCtx) {
      // Soporte cross-browser
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Genera un sonido rápido de click físico ("tick")
  private playTickSound(frequency: number = 300): void {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      // Decaimiento rápido de frecuencia
      osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime); // Volumen sutil
      gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio click error:', e);
    }
  }

  // Genera una pequeña melodía triunfal
  private playVictoryFanfare(): void {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      // Notas del acorde mayor arpegiado (Do, Mi, Sol, Do)
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      
      notes.forEach((freq, index) => {
        const time = now + index * 0.08;
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.12, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(time);
        osc.stop(time + 0.4);
      });
    } catch (e) {
      console.warn('Audio victory error:', e);
    }
  }

  private iniciarBucleRender(): void {
    const render = () => {
      this.actualizarFisica();
      this.dibujarRuleta();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  private actualizarFisica(): void {
    if (!this.isSpinning) return;

    // Actualizar ángulo
    this.angle += this.angularVelocity;

    // Aplicar fricción suave
    this.angularVelocity *= this.friction;

    // Comprobar tick de sonido al cruzar un sector (normalizado para evitar fallos de índice negativo)
    if (this.nombres.length > 0) {
      const numSectors = this.nombres.length;
      const sectorAngle = (2 * Math.PI) / numSectors;
      let normalizedAngle = this.angle % (2 * Math.PI);
      if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
      const currentSector = Math.floor(normalizedAngle / sectorAngle);
      
      if (currentSector !== this.lastSectorIndex) {
        // Reproducir sonido con tono ligeramente dinámico
        const pitch = 250 + (this.angularVelocity * 200);
        this.playTickSound(pitch);
        this.lastSectorIndex = currentSector;
      }
    }

    // Detener la ruleta al bajar de un umbral de velocidad
    if (this.angularVelocity < 0.0015) {
      this.isSpinning = false;
      this.angularVelocity = 0;
      this.celebrarGanador();
    }
  }

  private celebrarGanador(): void {
    if (this.nombres.length === 0) return;

    const numSectors = this.nombres.length;
    const sectorAngle = (2 * Math.PI) / numSectors;

    // El puntero o indicador ahora está en el centro de selección (0 radianes)
    let relativePointerAngle = -this.angle % (2 * Math.PI);
    if (relativePointerAngle < 0) {
      relativePointerAngle += 2 * Math.PI;
    }

    const selectedIndex = Math.round(relativePointerAngle / sectorAngle) % numSectors;
    this.ganador = this.nombres[selectedIndex];
    this.showWinnerModal = true;

    // Lanzar confeti y sonido
    this.playVictoryFanfare();
    this.lanzarConfeti();
  }

  private lanzarConfeti(): void {
    this.confettiActive = true;
    this.particles = [];
    const colors = ['#92D342', '#368475', '#ffffff', '#ffcc00', '#ff3366', '#33ccff'];
    
    // Crear 120 partículas de confeti desde el centro
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      this.particles.push({
        x: 0, // Se actualizará al centro del canvas al dibujar
        y: 0,
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 2, // Sesgo hacia arriba
        rotation: Math.random() * 360,
        rotationSpeed: -10 + Math.random() * 20,
        opacity: 1
      });
    }
  }

  eliminarGanador(): void {
    if (!this.ganador) return;
    this.nombres = this.nombres.filter(n => n !== this.ganador);
    this.sincronizarTextoDesdeNombres();
    this.resetearRuleta();
  }

  cerrarModalGanador(): void {
    this.showWinnerModal = false;
    this.confettiActive = false;
    this.particles = [];
  }

  private dibujarRuleta(): void {
    if (!this.wheelCanvas) return;
    const canvas = this.wheelCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Dimensiones del cilindro central
    const cylinderWidth = width * 0.76;
    const cylinderLeft = (width - cylinderWidth) / 2;
    const cylinderHeight = height * 0.90;
    const cylinderTop = (height - cylinderHeight) / 2;
    const radius = cylinderHeight / 2; // Radio de curvatura vertical

    // Si no hay nombres, dibujar panel vacío elegante
    if (this.nombres.length === 0) {
      ctx.save();
      // Fondo oscuro
      ctx.fillStyle = '#15171a';
      ctx.fillRect(cylinderLeft, cylinderTop, cylinderWidth, cylinderHeight);
      
      // Borde del slot
      ctx.strokeStyle = '#2d323a';
      ctx.lineWidth = 4 * window.devicePixelRatio;
      ctx.strokeRect(cylinderLeft, cylinderTop, cylinderWidth, cylinderHeight);

      // Texto de aviso
      ctx.fillStyle = '#666';
      ctx.font = `bold ${1.6 * window.devicePixelRatio}rem 'Bebas Neue', cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('AÑADE NOMBRES EN EL PANEL', centerX, centerY);
      ctx.restore();
      return;
    }

    const numSectors = this.nombres.length;
    const sectorAngle = (2 * Math.PI) / numSectors;

    ctx.save();

    // 1. Dibujar el fondo del cilindro (textura metálica oscura)
    ctx.fillStyle = '#1c1f24';
    ctx.fillRect(cylinderLeft, cylinderTop, cylinderWidth, cylinderHeight);

    // 2. Dibujar las líneas divisorias y los nombres proyectados en 3D
    const halfVisibleRange = 1.45; // Rango visible en radianes

    // Dibujar nombres
    for (let i = 0; i < numSectors; i++) {
      const nameAngle = i * sectorAngle;
      let phi = (nameAngle + this.angle) % (2 * Math.PI);
      
      if (phi > Math.PI) phi -= 2 * Math.PI;
      if (phi < -Math.PI) phi += 2 * Math.PI;

      if (phi >= -halfVisibleRange && phi <= halfVisibleRange) {
        const y = centerY + radius * Math.sin(phi);
        const scaleY = Math.cos(phi);
        const opacity = Math.pow(Math.cos(phi), 1.8);

        ctx.save();
        ctx.translate(centerX, y);
        ctx.scale(1.0, scaleY);

        const distanceToCenter = Math.abs(phi);
        // Color del poeta basado en los colores del evento
        const poetColor = this.getColorPoeta(this.nombres[i]);
        const rgb = this.hexToRgb(poetColor);
        let textColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        if (distanceToCenter < sectorAngle / 2) {
          // El seleccionado brilla más intenso (luminosidad aumentada)
          textColor = `rgba(${Math.min(rgb.r + 40, 255)}, ${Math.min(rgb.g + 40, 255)}, ${Math.min(rgb.b + 40, 255)}, ${Math.min(opacity + 0.2, 1)})`;
        }

        ctx.fillStyle = textColor;

        // Tamaño de fuente dinámico según cantidad de nombres
        let fontSize = 2.4;
        if (numSectors > 30) fontSize = 1.0;
        else if (numSectors > 20) fontSize = 1.3;
        else if (numSectors > 12) fontSize = 1.7;
        else if (numSectors > 8) fontSize = 2.1;

        ctx.font = `bold ${fontSize * window.devicePixelRatio}rem 'Bebas Neue', cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let text = this.nombres[i];
        if (text.length > 18) text = text.substring(0, 16) + '...';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 4 * window.devicePixelRatio;
        
        ctx.fillText(text.toUpperCase(), 0, 0);
        ctx.restore();
      }
    }

    // Dibujar líneas separadoras horizontales para dar el efecto de candado/tambor
    ctx.strokeStyle = '#24272c';
    ctx.lineWidth = 2 * window.devicePixelRatio;
    for (let i = 0; i < numSectors; i++) {
      const lineAngle = (i + 0.5) * sectorAngle;
      let phi = (lineAngle + this.angle) % (2 * Math.PI);
      
      if (phi > Math.PI) phi -= 2 * Math.PI;
      if (phi < -Math.PI) phi += 2 * Math.PI;

      if (phi >= -halfVisibleRange && phi <= halfVisibleRange) {
        const y = centerY + radius * Math.sin(phi);
        ctx.beginPath();
        ctx.moveTo(cylinderLeft, y);
        ctx.lineTo(cylinderLeft + cylinderWidth, y);
        ctx.stroke();
      }
    }

    // 3. Gradiente de sombra 3D (para dar volumen cilíndrico)
    const shadowGrad = ctx.createLinearGradient(0, cylinderTop, 0, cylinderTop + cylinderHeight);
    shadowGrad.addColorStop(0, 'rgba(10, 12, 15, 0.95)');
    shadowGrad.addColorStop(0.18, 'rgba(10, 12, 15, 0.6)');
    shadowGrad.addColorStop(0.5, 'rgba(10, 12, 15, 0)');
    shadowGrad.addColorStop(0.82, 'rgba(10, 12, 15, 0.6)');
    shadowGrad.addColorStop(1, 'rgba(10, 12, 15, 0.95)');

    ctx.fillStyle = shadowGrad;
    ctx.fillRect(cylinderLeft, cylinderTop, cylinderWidth, cylinderHeight);

    // 4. Dibujar el housing metálico exterior (marcos izquierdo y derecho)
    // Marco Izquierdo
    const frameGradL = ctx.createLinearGradient(0, 0, cylinderLeft, 0);
    frameGradL.addColorStop(0, '#111316');
    frameGradL.addColorStop(0.7, '#242830');
    frameGradL.addColorStop(1, '#0e0f11');
    ctx.fillStyle = frameGradL;
    ctx.fillRect(0, 0, cylinderLeft, height);

    // Marco Derecho
    const frameGradR = ctx.createLinearGradient(cylinderLeft + cylinderWidth, 0, width, 0);
    frameGradR.addColorStop(0, '#0e0f11');
    frameGradR.addColorStop(0.3, '#242830');
    frameGradR.addColorStop(1, '#111316');
    ctx.fillStyle = frameGradR;
    ctx.fillRect(cylinderLeft + cylinderWidth, 0, width - (cylinderLeft + cylinderWidth), height);

    // Líneas neón en los bordes del marco
    ctx.strokeStyle = '#2d323a';
    ctx.lineWidth = 2 * window.devicePixelRatio;
    ctx.beginPath();
    ctx.moveTo(cylinderLeft, 0);
    ctx.lineTo(cylinderLeft, height);
    ctx.moveTo(cylinderLeft + cylinderWidth, 0);
    ctx.lineTo(cylinderLeft + cylinderWidth, height);
    ctx.stroke();

    ctx.restore();

    // 5. Indicador de selección horizontal (Línea roja/verde neón del candado en el centro)
    ctx.save();
    const indicatorHeight = 56 * window.devicePixelRatio;
    
    ctx.fillStyle = 'rgba(146, 211, 66, 0.04)';
    ctx.fillRect(cylinderLeft, centerY - indicatorHeight / 2, cylinderWidth, indicatorHeight);

    ctx.strokeStyle = '#92D342';
    ctx.lineWidth = 2.5 * window.devicePixelRatio;
    ctx.shadowColor = '#92D342';
    ctx.shadowBlur = 10 * window.devicePixelRatio;
    
    ctx.beginPath();
    ctx.moveTo(cylinderLeft - 4, centerY - indicatorHeight / 2);
    ctx.lineTo(cylinderLeft + cylinderWidth + 4, centerY - indicatorHeight / 2);
    ctx.moveTo(cylinderLeft - 4, centerY + indicatorHeight / 2);
    ctx.lineTo(cylinderLeft + cylinderWidth + 4, centerY + indicatorHeight / 2);
    ctx.stroke();

    // Punteros triangulares en los extremos de la fila seleccionadora
    ctx.fillStyle = '#92D342';
    ctx.shadowBlur = 8 * window.devicePixelRatio;
    
    ctx.beginPath();
    ctx.moveTo(cylinderLeft - 10 * window.devicePixelRatio, centerY - 6 * window.devicePixelRatio);
    ctx.lineTo(cylinderLeft - 2 * window.devicePixelRatio, centerY);
    ctx.lineTo(cylinderLeft - 10 * window.devicePixelRatio, centerY + 6 * window.devicePixelRatio);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cylinderLeft + cylinderWidth + 10 * window.devicePixelRatio, centerY - 6 * window.devicePixelRatio);
    ctx.lineTo(cylinderLeft + cylinderWidth + 2 * window.devicePixelRatio, centerY);
    ctx.lineTo(cylinderLeft + cylinderWidth + 10 * window.devicePixelRatio, centerY + 6 * window.devicePixelRatio);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // 6. Confeti (si está activo)
    if (this.confettiActive && this.particles.length > 0) {
      this.dibujarConfeti(ctx, centerX, centerY);
    }
  }

  private dibujarConfeti(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    ctx.save();
    
    this.particles.forEach((p, idx) => {
      // Si la partícula es nueva, colocarla en el centro
      if (p.x === 0 && p.y === 0) {
        p.x = centerX;
        p.y = centerY;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      
      // Dibujar pequeño rectángulo de confeti
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
      ctx.restore();

      // Actualizar física de la partícula
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Gravedad
      p.speedY += 0.2;
      p.rotation += p.rotationSpeed;

      // Desvanecimiento progresivo
      p.opacity -= 0.008;

      // Eliminar partículas invisibles
      if (p.opacity <= 0) {
        this.particles.splice(idx, 1);
      }
    });

    ctx.restore();
  }
}

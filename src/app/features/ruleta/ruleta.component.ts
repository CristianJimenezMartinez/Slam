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

  // Estado del giro
  isSpinning: boolean = false;
  private angle: number = 0;
  private angularVelocity: number = 0;
  private friction: number = 0.985; // Desaceleración suave
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
      const size = Math.min(container.clientWidth, 600);
      canvas.width = size * window.devicePixelRatio;
      canvas.height = size * window.devicePixelRatio;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
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
          this.nombres = res.data.map(p => p.nombre);
          this.sincronizarTextoDesdeNombres();
          this.resetearRuleta();
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

    // Velocidad de giro inicial aleatoria e intensa
    this.angularVelocity = 0.5 + Math.random() * 0.4;
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

    // Comprobar tick de sonido al cruzar un sector
    if (this.nombres.length > 0) {
      const numSectors = this.nombres.length;
      const sectorAngle = (2 * Math.PI) / numSectors;
      // Posición del puntero en relación con el ángulo del lienzo
      const currentSector = Math.floor(((this.angle) % (2 * Math.PI)) / sectorAngle);
      
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

    // El puntero está en la parte superior (1.5 * Math.PI o 270 grados en canvas)
    // El ángulo de la ruleta gira en sentido de las agujas del reloj (positivo).
    // Posición del puntero relativa a la ruleta: (1.5 * Math.PI - angle)
    let relativePointerAngle = (1.5 * Math.PI - this.angle) % (2 * Math.PI);
    if (relativePointerAngle < 0) {
      relativePointerAngle += 2 * Math.PI;
    }

    const selectedIndex = Math.floor(relativePointerAngle / sectorAngle) % numSectors;
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
    const size = width;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = (size / 2) * 0.88;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Si no hay nombres, dibujar rueda vacía elegante
    if (this.nombres.length === 0) {
      ctx.save();
      // Fondo negro de la rueda con borde neón
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#222222';
      ctx.fill();
      ctx.lineWidth = 6 * window.devicePixelRatio;
      ctx.strokeStyle = '#92D342';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#92D342';
      ctx.stroke();

      // Texto de aviso
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#888888';
      ctx.font = `bold ${1.8 * window.devicePixelRatio}rem 'Bebas Neue', cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('AÑADE NOMBRES EN EL PANEL', centerX, centerY);
      ctx.restore();
      return;
    }

    const numSectors = this.nombres.length;
    const sectorAngle = (2 * Math.PI) / numSectors;

    ctx.save();

    // Dibujar sectores
    for (let i = 0; i < numSectors; i++) {
      const startAngle = this.angle + i * sectorAngle;
      const endAngle = startAngle + sectorAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Colores de los sectores (Estilo Slam - alternando verde neón, carbono y gris oscuro)
      let fillStyle = '#242424'; // Carbono
      if (numSectors % 2 === 0) {
        fillStyle = i % 2 === 0 ? '#92D342' : '#242424';
      } else {
        // Para impares, manejamos el último sector para que no choque
        if (i === numSectors - 1) {
          fillStyle = '#368475'; // Color de transición
        } else {
          fillStyle = i % 2 === 0 ? '#92D342' : '#242424';
        }
      }

      ctx.fillStyle = fillStyle;
      ctx.fill();

      // Borde sutil del sector
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 2 * window.devicePixelRatio;
      ctx.stroke();

      // Dibujar texto
      ctx.save();
      ctx.translate(centerX, centerY);
      // Rotar al centro del sector
      ctx.rotate(startAngle + sectorAngle / 2);

      // Determinar color de texto según el fondo para legibilidad
      ctx.fillStyle = fillStyle === '#92D342' ? '#1A1A1A' : '#F2F2F2';
      
      // Adaptar tamaño de fuente según cantidad de participantes
      let fontSize = 1.6;
      if (numSectors > 30) fontSize = 0.7;
      else if (numSectors > 20) fontSize = 0.9;
      else if (numSectors > 12) fontSize = 1.2;
      else if (numSectors > 8) fontSize = 1.4;

      ctx.font = `bold ${fontSize * window.devicePixelRatio}rem 'Bebas Neue', cursive`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Acortar nombres muy largos
      let text = this.nombres[i];
      if (text.length > 14) text = text.substring(0, 12) + '...';

      // Dibujar texto desplazado del centro hacia el borde externo
      ctx.fillText(text.toUpperCase(), radius - (15 * window.devicePixelRatio), 0);
      ctx.restore();
    }

    // Dibujar círculo exterior decorativo (Borde neón de la ruleta)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 8 * window.devicePixelRatio;
    ctx.strokeStyle = '#1A1A1A';
    ctx.stroke();

    // Añadir anillo exterior neón verde
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + (4 * window.devicePixelRatio), 0, 2 * Math.PI);
    ctx.lineWidth = 2 * window.devicePixelRatio;
    ctx.strokeStyle = '#92D342';
    ctx.stroke();

    // Centro decorativo (Tapa de la ruleta)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.18, 0, 2 * Math.PI);
    ctx.fillStyle = '#1A1A1A';
    ctx.fill();
    ctx.lineWidth = 3 * window.devicePixelRatio;
    ctx.strokeStyle = '#92D342';
    ctx.stroke();

    // Logo del Slam o icono en el centro
    ctx.fillStyle = '#92D342';
    ctx.font = `bold ${1.1 * window.devicePixelRatio}rem 'Bebas Neue', cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SLAM', centerX, centerY);

    ctx.restore();

    // Dibujar el puntero (en la parte superior apuntando hacia abajo)
    ctx.save();
    ctx.translate(centerX, centerY - radius - (8 * window.devicePixelRatio));
    
    // Sombra del puntero para darle profundidad
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';

    ctx.beginPath();
    ctx.moveTo(0, 24 * window.devicePixelRatio); // Punta que señala abajo
    ctx.lineTo(-15 * window.devicePixelRatio, -10 * window.devicePixelRatio);
    ctx.lineTo(15 * window.devicePixelRatio, -10 * window.devicePixelRatio);
    ctx.closePath();

    ctx.fillStyle = '#EF4444'; // Rojo neón para máxima visibilidad
    ctx.fill();
    ctx.lineWidth = 2 * window.devicePixelRatio;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    
    ctx.restore();

    // Dibujar confeti en tiempo real si está activo
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

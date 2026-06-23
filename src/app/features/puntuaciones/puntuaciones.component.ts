import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { EventosService, Evento } from '../../core/services/eventos.service';
import { VotacionesService, Resultado } from '../../core/services/votaciones.service';
import { Subscription } from 'rxjs';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-puntuaciones',
  templateUrl: './puntuaciones.component.html',
  styleUrls: ['./puntuaciones.component.scss']
})
export class PuntuacionesComponent implements OnInit, OnDestroy {
  evento: Evento | null = null;
  resultados: Resultado[] = [];
  finalistas: Resultado[] = []; // Nueva variable para los clasificados
  loading = true;
  mostrarResultados = false;
  rondaActual = 1;
  qrCodeUrl: string | null = null;
  
  private subscription: Subscription | any = null;

  constructor(
    private eventosService: EventosService,
    private votacionesService: VotacionesService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const ev = await this.eventosService.getEventoActivo().toPromise();
      if (ev) {
        this.evento = ev;
        this.mostrarResultados = !!ev.puntuaciones_activas;
        this.rondaActual = Number(ev.ronda_activa) || 1;
        
        this.updateTheme(ev.color_primario);
        await this.refreshResultados();
        await this.generarQR();

        if (this.rondaActual === 3) {
          await this.cargarFinalistas();
        }

        // Realtime
        if (this.subscription) this.subscription.unsubscribe();
        this.subscription = this.eventosService.listenToEventoChanges(ev.id, (payload: any) => {
          this.ngZone.run(async () => {
            if (payload.new) {
              const oldRonda = this.rondaActual;
              this.evento = { ...this.evento, ...payload.new } as Evento;
              this.mostrarResultados = !!payload.new.puntuaciones_activas;
              this.rondaActual = Number(payload.new.ronda_activa) || 1;
              
              this.updateTheme(payload.new.color_primario);

              if (this.rondaActual === 3 && oldRonda < 3) {
                await this.cargarFinalistas();
              }
              await this.refreshResultados();
              this.generarQR();
            }
          });
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  private updateTheme(color?: string) {
    if (!color) return;
    document.documentElement.style.setProperty('--primary', color);
    // También generamos el RGB para las sombras
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
  }

  async refreshResultados() {
    if (!this.evento) return;
    const res = await this.votacionesService.getResultados(this.evento.id, this.rondaActual).toPromise();
    const data = (res?.data || []) as Resultado[];
    // Ordenamos por posicion en la clasificacion oficial
    this.resultados = data.sort((a, b) => a.posicion - b.posicion);
  }

  async cargarFinalistas() {
    if (!this.evento) return;
    // Pedimos los resultados de la Ronda 2 (Clasificatoria)
    const res = await this.votacionesService.getResultados(this.evento.id, 2).toPromise();
    if (res?.data) {
      const resultados = res.data as Resultado[];
      if (resultados.length > 0) {
        // Encontrar la puntuación del N-ésimo participante (o el último si hay menos)
        const limit = this.evento.limite_finalistas || 3;
        const indexCorte = Math.min(limit - 1, resultados.length - 1);
        const puntuacionCorte = resultados[indexCorte].puntuacion_total;
        
        // Incluimos a todos los que empaten o superen la puntuación de corte para evitar dejarlos fuera
        this.finalistas = resultados.filter(r => r.puntuacion_total >= puntuacionCorte) as Resultado[];
      } else {
        this.finalistas = [];
      }
    }
  }

  async generarQR() {
    if (!this.evento) return;
    try {
      const origin = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'https://poetryslamalicante.com'
        : window.location.origin;

      const votingUrl = `${origin}/votar?access_code=${this.evento.id}`;
      const url = await QRCode.toDataURL(votingUrl);
      this.ngZone.run(() => {
        this.qrCodeUrl = url;
      });
    } catch (e) {
      console.error('Error al generar QR:', e);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}

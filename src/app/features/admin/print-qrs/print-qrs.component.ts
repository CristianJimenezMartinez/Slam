import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CredencialesService, CredencialVoto } from '../../../core/services/credenciales.service';
import { EventosService, Evento } from '../../../core/services/eventos.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-print-qrs',
  templateUrl: './print-qrs.component.html',
  styleUrls: ['./print-qrs.component.scss']
})
export class PrintQrsComponent implements OnInit {
  evento: Evento | null = null;
  credenciales: CredencialVoto[] = [];
  qrUrls: { [id: string]: string } = {};
  loading = true;

  /** Credenciales divididas en páginas de 66 (6 columnas × 11 filas) */
  pages: CredencialVoto[][] = [];
  readonly PAGE_SIZE = 66;

  constructor(
    private route: ActivatedRoute,
    private credencialesService: CredencialesService,
    private eventosService: EventosService,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    const eventoId = this.route.snapshot.paramMap.get('eventoId');
    if (!eventoId) {
      this.loading = false;
      return;
    }

    try {
      // 1. Obtener datos de todos los eventos y buscar el actual
      const evs = await this.eventosService.getEventos().toPromise();
      this.evento = evs?.data?.find((e: any) => e.id === eventoId) || null;

      if (this.evento) {
        // 2. Obtener credenciales existentes para este evento
        const res = await this.credencialesService.getCredencialesByEvento(eventoId).toPromise();
        this.credenciales = res.data || [];

        // Si no existen credenciales, generar automáticamente 132 (2 páginas de 66 exactas)
        if (this.credenciales.length === 0) {
          const insertRes = await this.credencialesService.generarCredenciales(eventoId, 132);
          this.credenciales = insertRes.data || [];
        }

        // 3. Dividir credenciales en páginas de 66
        this.pages = [];
        for (let i = 0; i < this.credenciales.length; i += this.PAGE_SIZE) {
          this.pages.push(this.credenciales.slice(i, i + this.PAGE_SIZE));
        }

        // 4. Generar imágenes QR en base64 para cada credencial
        for (const cred of this.credenciales) {
          const qrUrl = `${window.location.origin}/votar?credencial=${cred.id}`;
          this.qrUrls[cred.id] = await QRCode.toDataURL(qrUrl, { margin: 1, width: 120 });
        }

        this.ngZone.run(() => {
          this.loading = false;
        });
      } else {
        this.loading = false;
      }
    } catch (e) {
      console.error('Error generando QRs imprimibles:', e);
      this.loading = false;
    }
  }

  /** Calcula el número global de la credencial para mostrar VOTO #N */
  getGlobalIndex(pageIndex: number, cardIndex: number): number {
    return pageIndex * this.PAGE_SIZE + cardIndex + 1;
  }

  /** Lanza el diálogo de imprimir / guardar como PDF del navegador */
  print(): void {
    window.print();
  }
}

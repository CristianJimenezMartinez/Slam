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

  /** Credenciales divididas en páginas de 28 (4 columnas × 7 filas) */
  pages: CredencialVoto[][] = [];
  readonly PAGE_SIZE = 28;
  cantidadPersonalizada = 240;
  regenerating = false;

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
        let currentCreds = res.data || [];

        // Si no existen credenciales, generar automáticamente 240 (el valor por defecto)
        if (currentCreds.length === 0) {
          const insertRes = await this.credencialesService.generarCredenciales(eventoId, this.cantidadPersonalizada);
          currentCreds = insertRes.data || [];
        }

        await this.procesarCredenciales(currentCreds);

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

  /** Procesa la lista completa de credenciales: divide en páginas y genera los QR base64 necesarios */
  async procesarCredenciales(creds: CredencialVoto[]) {
    this.credenciales = creds;

    // Dividir en páginas de PAGE_SIZE
    this.pages = [];
    for (let i = 0; i < this.credenciales.length; i += this.PAGE_SIZE) {
      this.pages.push(this.credenciales.slice(i, i + this.PAGE_SIZE));
    }

    // Generar imágenes QR
    const origin = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'https://poetryslamalicante.com'
      : window.location.origin;

    for (const cred of this.credenciales) {
      if (!this.qrUrls[cred.id]) {
        const qrUrl = `${origin}/votar?credencial=${cred.id}`;
        this.qrUrls[cred.id] = await QRCode.toDataURL(qrUrl, { margin: 1, width: 200 });
      }
    }
  }

  /** Elimina todas las credenciales actuales y genera el número personalizado especificado */
  async regenerarCredenciales() {
    if (!this.evento) return;
    const confirmacion = confirm(
      `¿Seguro que deseas BORRAR las ${this.credenciales.length} credenciales actuales y generar exactamente ${this.cantidadPersonalizada} credenciales nuevas?\n\n¡ATENCIÓN! Los códigos QR que ya hayas impreso para este evento dejarán de funcionar.`
    );
    if (!confirmacion) return;

    this.loading = true;
    this.regenerating = true;
    try {
      await this.credencialesService.borrarCredenciales(this.evento.id);
      this.qrUrls = {};
      
      const insertRes = await this.credencialesService.generarCredenciales(this.evento.id, this.cantidadPersonalizada);
      const nuevasCreds = insertRes.data || [];

      await this.procesarCredenciales(nuevasCreds);
    } catch (e) {
      console.error('Error al regenerar credenciales:', e);
      alert('Error al generar credenciales.');
    } finally {
      this.loading = false;
      this.regenerating = false;
    }
  }

  /** Añade credenciales adicionales al evento sin borrar las que ya existen */
  async agregarCredenciales() {
    if (!this.evento) return;
    const cantidadStr = prompt(`¿Cuántas credenciales adicionales deseas añadir al evento actual?`, '50');
    if (!cantidadStr) return;
    const cantidad = parseInt(cantidadStr, 10);
    if (isNaN(cantidad) || cantidad <= 0) {
      alert('Cantidad inválida.');
      return;
    }

    this.loading = true;
    this.regenerating = true;
    try {
      const insertRes = await this.credencialesService.generarCredenciales(this.evento.id, cantidad);
      
      const res = await this.credencialesService.getCredencialesByEvento(this.evento.id).toPromise();
      const todasCreds = res.data || [];

      await this.procesarCredenciales(todasCreds);
    } catch (e) {
      console.error('Error al agregar credenciales:', e);
      alert('Error al agregar credenciales.');
    } finally {
      this.loading = false;
      this.regenerating = false;
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

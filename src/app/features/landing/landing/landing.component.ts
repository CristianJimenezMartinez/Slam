import { Component, OnInit } from '@angular/core';
import { EventosService, Evento } from '../../../core/services/eventos.service';
import { CronogramaService, Cronograma } from '../../../core/services/cronograma.service';
import { ParticipantesService, Participante } from '../../../core/services/participantes.service';
import { SeoService } from '../../../core/services/seo.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  evento: Evento | null = null;
  proximoEnCronograma: Cronograma | null = null;
  participantes: Participante[] = [];
  proximosCronograma: Cronograma[] = [];
  qrCodeUrl: string | null = null;
  loading = true;
  currentYear = new Date().getFullYear();
  fotoTemporada: string | null = null;
  edicionTexto = '';
  urlPaseTemporada: string | null = null;
  
  // El Interruptor Inteligente
  esEventoInminente = false;

  constructor(
    private eventosService: EventosService,
    private cronogramaService: CronogramaService,
    private participantesService: ParticipantesService,
    private seo: SeoService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  scrollToSlider() {
    const el = document.getElementById('season-slider');
    const isMobile = window.innerWidth <= 768;
    const headerOffset = isMobile ? 0 : 60; // En móvil baja al máximo
    if (el) {
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  async loadData() {
    this.loading = true;
    
    // 1. Obtener el evento detallado para ver si es inminente
    const activeRes = await this.eventosService.getEventoActivo().toPromise();
    this.evento = activeRes || null;

    if (this.evento) {
      const fechaEvento = new Date(this.evento.fecha);
      const hoy = new Date();
      const diffTime = fechaEvento.getTime() - hoy.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Si faltan 7 días o menos, activamos el modo evento
      this.esEventoInminente = diffDays <= 7 && diffDays >= 0;

      if (this.esEventoInminente) {
        const partsRes = await this.participantesService.getParticipantesByEvento(this.evento.id).toPromise();
        if (partsRes?.data) {
          this.participantes = partsRes.data as Participante[];
        }
        const votingUrl = `${window.location.origin}/votar`;
        this.qrCodeUrl = await QRCode.toDataURL(votingUrl);
      }
    }

    // 2. Cargar cronograma para la publicidad y foto global
    const cronoRes = await this.cronogramaService.getCronograma().toPromise();
    if (cronoRes && cronoRes.data) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const allCrono = cronoRes.data as Cronograma[];
      
      this.proximosCronograma = allCrono.filter(ev => new Date(ev.fecha) >= today);
      
      // Extraemos la foto, la edición y el pase de temporada del primer registro
      if (allCrono.length > 0) {
        this.fotoTemporada = allCrono[0].url_foto || null;
        this.edicionTexto = allCrono[0].edicion || '';
        this.urlPaseTemporada = allCrono[0].url_pase_temporada || null;
      }

      // Si no hay evento inmimente, necesitamos saber cuál es el primer item del cronograma para el Hero
      if (!this.esEventoInminente && this.proximosCronograma.length > 0) {
        this.proximoEnCronograma = this.proximosCronograma[0];
      }
    }

    // 3. SEO dinámico según el estado de la landing
    this.updateSeo();
    
    this.loading = false;
  }

  private updateSeo(): void {
    if (this.esEventoInminente && this.evento) {
      this.seo.setPage({
        title: this.evento.nombre,
        description: this.evento.descripcion
          || `${this.evento.nombre} – Poetry Slam en vivo en Las Cigarreras, Alicante. ¡Reserva tu entrada!`,
        path: '/'
      });
      this.seo.setEventJsonLd(this.evento);
    } else {
      this.seo.setPage({
        title: `Temporada ${this.currentYear}`,
        description: `Poetry Slam Alicante – Temporada ${this.currentYear}. Encuentro de poesía en vivo en Las Cigarreras. Consulta el calendario y compra tus entradas.`,
        path: '/'
      });
      if (this.proximosCronograma.length > 0) {
        this.seo.setEventsJsonLd(this.proximosCronograma);
      }
    }
  }
}

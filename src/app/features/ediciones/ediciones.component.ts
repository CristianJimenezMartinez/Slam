import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { SlamEdicion } from '../../core/models/edicion.model';
import { EdicionesService } from '../../core/services/ediciones.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-ediciones',
  templateUrl: './ediciones.component.html',
  styleUrls: ['./ediciones.component.scss']
})
export class EdicionesComponent implements OnInit, OnDestroy {
  ediciones: SlamEdicion[] = [];
  edicionSeleccionada: SlamEdicion | null = null;
  filtroActivo: number | 'todas' = 'todas';

  // Lightbox de cartelería en alta resolución
  cartelModalAbierto: boolean = false;
  cartelModalUrl: string = '';
  cartelModalTitulo: string = '';

  private sub: Subscription = new Subscription();

  constructor(
    private edicionesService: EdicionesService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.configurarSeo();

    this.sub.add(
      this.edicionesService.getEdiciones().subscribe(lista => {
        this.ediciones = lista;
        if (typeof this.filtroActivo === 'number') {
          this.edicionSeleccionada = this.ediciones.find(e => e.numero === this.filtroActivo) || null;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /**
   * Cambia el filtro para ver todas las ediciones o una específica
   */
  seleccionarFiltro(filtro: number | 'todas'): void {
    this.filtroActivo = filtro;
    if (filtro === 'todas') {
      this.edicionSeleccionada = null;
    } else {
      this.edicionSeleccionada = this.ediciones.find(e => e.numero === filtro) || null;
    }
  }

  /**
   * Navega a la edición anterior o siguiente en la vista detallada
   */
  navegarEdicion(direccion: 'anterior' | 'siguiente'): void {
    if (!this.edicionSeleccionada) return;
    const currentIndex = this.ediciones.findIndex(e => e.numero === this.edicionSeleccionada!.numero);
    if (currentIndex === -1) return;

    if (direccion === 'anterior' && currentIndex > 0) {
      this.seleccionarFiltro(this.ediciones[currentIndex - 1].numero);
    } else if (direccion === 'siguiente' && currentIndex < this.ediciones.length - 1) {
      this.seleccionarFiltro(this.ediciones[currentIndex + 1].numero);
    }
  }

  /**
   * Abre el visualizador inmersivo del cartel
   */
  abrirCartelModal(url: string, titulo: string): void {
    this.cartelModalUrl = url;
    this.cartelModalTitulo = titulo;
    this.cartelModalAbierto = true;
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el visualizador del cartel
   */
  cerrarCartelModal(): void {
    this.cartelModalAbierto = false;
    this.cartelModalUrl = '';
    this.cartelModalTitulo = '';
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.cartelModalAbierto) {
      this.cerrarCartelModal();
    }
  }

  private configurarSeo(): void {
    this.seoService.setPage({
      title: 'Salón del Slam - Memoria de Ediciones',
      description: 'Crónica oficial y memoria viva de las veladas de Poetry Slam Alicante. Ganadores del Laurel de Oro, finalistas de honor, voces invitadas y cartelería histórica.',
      path: '/salon'
    });
  }
}

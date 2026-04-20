import { Component, OnInit } from '@angular/core';
import { CronogramaService, Cronograma } from '../../../core/services/cronograma.service';
import { EventosService } from '../../../core/services/eventos.service';

@Component({
  selector: 'app-cronograma-list',
  templateUrl: './cronograma-list.component.html',
  styleUrls: ['./cronograma-list.component.scss']
})
export class CronogramaListComponent implements OnInit {
  items: Cronograma[] = [];
  loading = true;
  currentYear = new Date().getFullYear();
  fotoTemporada: string | null = null;
  edicionTexto: string = '';
  urlPaseTemporada: string = '';
  
  // Colores de Temporada
  colorPrimario: string = '#92D342';
  colorSecundario: string = '#368475';
  colorCabecera: string = '#1A1A1A';
  colorFondo: string = '#1A1A1A';
  colorTexto: string = '#F2F2F2';
  
  // Para añadir nuevos en lote
  newItems: Partial<Cronograma>[] = [
    { nombre: '', fecha: '', url_entradas: '', ubicacion: '' }
  ];

  constructor(
    private cronogramaService: CronogramaService,
    private eventosService: EventosService
  ) { }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems() {
    this.loading = true;
    this.cronogramaService.getCronograma().subscribe(res => {
      this.items = res.data || [];
      // Extraemos parámetros globales de la primera fila si existe
      if (this.items.length > 0) {
        this.fotoTemporada = this.items[0].url_foto || null;
        this.edicionTexto = this.items[0].edicion || '';
        this.urlPaseTemporada = this.items[0].url_pase_temporada || '';
        
        // Cargar colores
        this.colorPrimario = this.items[0].color_primario || '#92D342';
        this.colorSecundario = this.items[0].color_secundario || '#368475';
        this.colorCabecera = this.items[0].color_cabecera || '#1A1A1A';
        this.colorFondo = this.items[0].color_fondo || '#1A1A1A';
        this.colorTexto = this.items[0].color_texto || '#F2F2F2';
      }
      this.loading = false;
    });
  }

  addMoreRows() {
    this.newItems.push({ nombre: '', fecha: '', url_entradas: '', ubicacion: '' });
  }

  async saveNewItems() {
    const validItems = this.newItems.filter(item => item.nombre && item.fecha);
    if (validItems.length === 0) {
      alert('Rellena al menos el nombre y la fecha de un evento.');
      return;
    }

    this.loading = true;
    for (const item of validItems) {
      // Aplicamos la configuración global a los nuevos
      item.url_foto = this.fotoTemporada || '';
      item.edicion = this.edicionTexto;
      item.url_pase_temporada = this.urlPaseTemporada;
      item.color_primario = this.colorPrimario;
      item.color_secundario = this.colorSecundario;
      item.color_cabecera = this.colorCabecera;
      item.color_fondo = this.colorFondo;
      item.color_texto = this.colorTexto;
      item.ubicacion = item.ubicacion || 'Caja Negra, Las Cigarreras'; // Valor por defecto
      await this.cronogramaService.createCronograma(item);
    }
    
    this.newItems = [{ nombre: '', fecha: '', url_entradas: '', ubicacion: '' }];
    this.loadItems();
    alert('¡Cronograma actualizado!');
  }

  async saveGlobalSettings() {
    this.loading = true;
    const updates = { 
      edicion: this.edicionTexto, 
      url_pase_temporada: this.urlPaseTemporada,
      color_primario: this.colorPrimario,
      color_secundario: this.colorSecundario,
      color_cabecera: this.colorCabecera,
      color_fondo: this.colorFondo,
      color_texto: this.colorTexto
    };
    await this.cronogramaService.updateGlobalSettings(updates);
    this.loadItems();
    alert('Configuración global actualizada para toda la temporada.');
  }

  async updateItem(item: Cronograma) {
    await this.cronogramaService.updateCronograma(item.id, item);
  }

  async onSeasonFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.loading = true;
      const url = await this.eventosService.uploadCartel(file);
      if (url) {
        this.fotoTemporada = url;
        await this.cronogramaService.updateGlobalSettings({ url_foto: url });
        this.loadItems(); // Recargamos para que todo el listado se vea igual
        alert('Foto de temporada actualizada globalmente.');
      }
      this.loading = false;
    }
  }

  async deleteItem(id: string) {
    if (confirm('¿Eliminar esta fecha del cronograma?')) {
      await this.cronogramaService.deleteCronograma(id);
      this.loadItems();
    }
  }

  formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  }
}

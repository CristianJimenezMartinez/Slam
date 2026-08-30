import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-cantera',
  templateUrl: './cantera.component.html',
  styleUrls: ['./cantera.component.scss']
})
export class CanteraComponent implements OnInit {
  // Estado del Modal y Pasos
  isModalOpen: boolean = false;
  pasoActual: number = 1; // 1: Detalles de la actividad | 2: Datos de contacto | 3: Éxito

  // Selector rápido: 'escuela' o 'poeta'
  tipoContacto: 'escuela' | 'poeta' = 'escuela';

  // Campos para Centro Escolar
  nombreCentro: string = '';
  nivelEducativo: string = 'ESO y Bachillerato';
  formatoDeseado: string = 'Taller Práctico en Aulas';
  personaContacto: string = '';
  email: string = '';
  telefono: string = '';
  localidad: string = '';
  mensaje: string = '';

  // Campos para Poeta Particular
  nombrePoeta: string = '';
  edad: string = '';
  experiencia: string = 'Iniciación (Quiero aprender)';
  emailPoeta: string = '';
  telefonoPoeta: string = '';
  mensajePoeta: string = '';

  // Estado del formulario
  enviado: boolean = false;
  copiado: boolean = false;

  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Talleres de Poesía Escénica y Oratoria para Colegios en Alicante | Cantera',
      description: 'Llevamos la palabra viva y la oratoria a los centros educativos e institutos de Alicante. Talleres de creatividad, expresión oral y poesía slam para ESO, Bachillerato y jóvenes creadores.',
      path: '/cantera'
    });
    this.seo.setCanteraJsonLd();
  }

  abrirModal(tipo: 'escuela' | 'poeta'): void {
    this.tipoContacto = tipo;
    this.pasoActual = 1;
    this.enviado = false;
    this.copiado = false;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    document.body.style.overflow = '';
  }

  setTipo(tipo: 'escuela' | 'poeta'): void {
    this.tipoContacto = tipo;
  }

  siguientePaso(): void {
    if (this.pasoActual < 2) {
      this.pasoActual++;
    }
  }

  anteriorPaso(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  enviarFormulario(): void {
    const destino = 'poetryslamalicante@gmail.com';
    let asunto = '';
    let cuerpo = '';

    if (this.tipoContacto === 'escuela') {
      asunto = `[CANTERA - CENTRO ESCOLAR] Solicitud de taller: ${this.nombreCentro || 'Centro Educativo'}`;
      cuerpo = `--- SOLICITUD ESPACIO CANTERA (CENTRO EDUCATIVO) ---%0D%0A%0D%0A` +
        `• Centro Escolar / IES: ${encodeURIComponent(this.nombreCentro)}%0D%0A` +
        `• Nivel / Cursos: ${encodeURIComponent(this.nivelEducativo)}%0D%0A` +
        `• Formato de Actividad: ${encodeURIComponent(this.formatoDeseado)}%0D%0A` +
        `• Persona / Dto. de Contacto: ${encodeURIComponent(this.personaContacto)}%0D%0A` +
        `• Email de contacto: ${encodeURIComponent(this.email)}%0D%0A` +
        `• Teléfono: ${encodeURIComponent(this.telefono || 'No especificado')}%0D%0A` +
        `• Localidad / Municipio: ${encodeURIComponent(this.localidad || 'Alicante')}%0D%0A%0D%0A` +
        `• DETALLES / MENSAJE:%0D%0A${encodeURIComponent(this.mensaje || 'Solicitud de información sobre talleres.')}%0D%0A%0D%0A` +
        `----------------------------------------------------`;
    } else {
      asunto = `[CANTERA - JOVEN POETA] Inscripción de: ${this.nombrePoeta || 'Nuevo Creador'}`;
      cuerpo = `--- SOLICITUD ESPACIO CANTERA (JOVEN POETA / PARTICULAR) ---%0D%0A%0D%0A` +
        `• Nombre del Poeta: ${encodeURIComponent(this.nombrePoeta)}%0D%0A` +
        `• Edad: ${encodeURIComponent(this.edad || 'No especificada')}%0D%0A` +
        `• Nivel / Experiencia: ${encodeURIComponent(this.experiencia)}%0D%0A` +
        `• Email de contacto: ${encodeURIComponent(this.emailPoeta)}%0D%0A` +
        `• Teléfono / WhatsApp: ${encodeURIComponent(this.telefonoPoeta || 'No especificado')}%0D%0A%0D%0A` +
        `• MOTIVACIÓN / MENSAJE:%0D%0A${encodeURIComponent(this.mensajePoeta || 'Interés en formar parte de la Cantera.')}%0D%0A%0D%0A` +
        `----------------------------------------------------`;
    }

    const mailtoUrl = `mailto:${destino}?subject=${encodeURIComponent(asunto)}&body=${cuerpo}`;
    
    // Abrir cliente de correo
    window.location.href = mailtoUrl;
    this.enviado = true;
    this.pasoActual = 3;
  }

  copiarDatos(): void {
    let resumen = '';
    if (this.tipoContacto === 'escuela') {
      resumen = `--- SOLICITUD CANTERA (CENTRO EDUCATIVO) ---\n` +
        `Centro: ${this.nombreCentro}\n` +
        `Nivel: ${this.nivelEducativo}\n` +
        `Formato: ${this.formatoDeseado}\n` +
        `Contacto: ${this.personaContacto}\n` +
        `Email: ${this.email}\n` +
        `Teléfono: ${this.telefono}\n` +
        `Localidad: ${this.localidad}\n` +
        `Mensaje: ${this.mensaje}\n`;
    } else {
      resumen = `--- SOLICITUD CANTERA (JOVEN POETA) ---\n` +
        `Nombre: ${this.nombrePoeta}\n` +
        `Edad: ${this.edad}\n` +
        `Experiencia: ${this.experiencia}\n` +
        `Email: ${this.emailPoeta}\n` +
        `Teléfono: ${this.telefonoPoeta}\n` +
        `Mensaje: ${this.mensajePoeta}\n`;
    }

    navigator.clipboard.writeText(resumen).then(() => {
      this.copiado = true;
      setTimeout(() => this.copiado = false, 4000);
    });
  }

  resetForm(): void {
    this.enviado = false;
    this.copiado = false;
    this.pasoActual = 1;
    this.nombreCentro = '';
    this.personaContacto = '';
    this.email = '';
    this.telefono = '';
    this.localidad = '';
    this.mensaje = '';
    this.nombrePoeta = '';
    this.edad = '';
    this.emailPoeta = '';
    this.telefonoPoeta = '';
    this.mensajePoeta = '';
  }
}

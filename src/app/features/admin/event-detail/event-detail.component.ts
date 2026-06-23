import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventosService } from '../../../core/services/eventos.service';
import { ParticipantesService } from '../../../core/services/participantes.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  eventForm: FormGroup;
  @Input() eventId: string | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  loading = false;
  cartelFile: File | null = null;
  cartelPreview: string | null = null;
  oldCartelUrl: string | null = null;
  removeCartelFlag = false;
  existingCarteles: { name: string, url: string }[] = [];
  poetaQuemaId: string | null = null;
  participantesAEliminar: string[] = [];

  private toLocalISOString(date: Date): string {
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localIsoTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localIsoTime;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventosService: EventosService,
    private participantesService: ParticipantesService
  ) {
    this.eventForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      fecha: [this.toLocalISOString(new Date()), Validators.required],
      url_entradas: [''],
      url_cartel: [''],
      presentador: ['Ágora Reix'],
      artista_invitado: [''],
      poeta_quema: ['Poeta de Demostración', Validators.required],
      color_primario: ['#92D342', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      color_secundario: ['#368475', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      color_fondo: ['#1A1A1A', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      color_texto: ['#F2F2F2', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      color_cabecera: ['#1A1A1A', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      limite_finalistas: [3, [Validators.required, Validators.min(1)]],
      participantes: this.fb.array([])
    });
  }

  get participantes(): FormArray {
    return this.eventForm.get('participantes') as FormArray;
  }

  ngOnInit(): void {
    if (this.eventId) {
      this.loadEvent();
    }
    this.loadExistingCarteles();
  }

  async loadExistingCarteles() {
    this.existingCarteles = await this.eventosService.listCarteles();
  }

  async loadEvent() {
    this.loading = true;
    const res = await lastValueFrom(this.eventosService.getEventos());
    const evento = res?.data;
    const ev = (evento as any[] | null)?.find(e => e.id === this.eventId);
    if (ev) {
      this.eventForm.patchValue({
        nombre: ev.nombre,
        descripcion: ev.descripcion,
        fecha: this.toLocalISOString(new Date(ev.fecha)),
        url_entradas: ev.url_entradas || '',
        url_cartel: ev.url_cartel || '',
        presentador: ev.presentador || '',
        artista_invitado: ev.artista_invitado || '',
        color_primario: ev.color_primario || '#92D342',
        color_secundario: ev.color_secundario || '#368475',
        color_fondo: ev.color_fondo || '#1A1A1A',
        color_texto: ev.color_texto || '#F2F2F2',
        color_cabecera: ev.color_cabecera || '#1A1A1A',
        limite_finalistas: ev.limite_finalistas || 3
      });
      if (ev.url_cartel) {
        this.oldCartelUrl = ev.url_cartel;
        this.cartelPreview = ev.url_cartel;
      }

      const resParts = await lastValueFrom(this.participantesService.getParticipantesByEvento(this.eventId!));
      const parts = (resParts?.data || []) as any[];
      parts.forEach(p => {
        if (p.orden === 0) {
          this.poetaQuemaId = p.id;
          this.eventForm.patchValue({ poeta_quema: p.nombre });
        } else {
          this.participantes.push(this.fb.group({
            id: [p.id],
            nombre: [p.nombre, Validators.required],
            orden: [p.orden]
          }));
        }
      });
    }

    this.loading = false;
  }

  addParticipante() {
    this.participantes.push(this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      orden: [this.participantes.length + 1]
    }));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.cartelFile = file;
      this.removeCartelFlag = false;
      const reader = new FileReader();
      reader.onload = e => this.cartelPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  onRemoveCartel() {
    this.cartelPreview = null;
    this.cartelFile = null;
    this.removeCartelFlag = true;
    this.eventForm.patchValue({ url_cartel: '' });
  }

  selectExistingCartel(url: string) {
    this.cartelPreview = url;
    this.cartelFile = null;
    this.removeCartelFlag = false;
    this.eventForm.patchValue({ url_cartel: url });
  }

  removeParticipante(index: number) {
    const p = this.participantes.at(index).value;
    if (p.id) {
      this.participantesAEliminar.push(p.id);
    }
    this.participantes.removeAt(index);
  }

  async onSubmit() {
    if (this.eventForm.invalid) {
      alert('Por favor, indica al menos el Nombre del Evento y la Fecha.');
      return;
    }
    this.loading = true;

    let uploadedUrl = null;

    if (this.cartelFile) {
      uploadedUrl = await this.eventosService.uploadCartel(this.cartelFile);
    }

    if (uploadedUrl) {
      this.eventForm.patchValue({ url_cartel: uploadedUrl });
    } else if (this.removeCartelFlag) {
      this.eventForm.patchValue({ url_cartel: '' });
    }

    const { nombre, descripcion, fecha, url_entradas, url_cartel, presentador, artista_invitado, poeta_quema, participantes, color_primario, color_secundario, color_fondo, color_texto, color_cabecera, limite_finalistas } = this.eventForm.value;

    // Convertir el string local a una fecha ISO real con su zona horaria antes de enviar a Supabase
    const fechaISO = new Date(fecha).toISOString();

    const eventoData = { nombre, descripcion, fecha: fechaISO, url_entradas, url_cartel, presentador, artista_invitado, color_primario, color_secundario, color_fondo, color_texto, color_cabecera, limite_finalistas };

    let res;
    if (this.eventId) {
      res = await this.eventosService.updateEvento(this.eventId, eventoData);
    } else {
      res = await this.eventosService.createEvento(eventoData);
      this.eventId = (res.data as any).id;
    }

    if (this.eventId) {
      // 1. Eliminar participantes borrados
      if (this.participantesAEliminar.length > 0) {
        for (const id of this.participantesAEliminar) {
          await this.participantesService.deleteParticipante(id);
        }
        this.participantesAEliminar = []; // Limpiar lista
      }

      // 2. Guardar/Actualizar Poeta de la Quema (demostración)
      if (poeta_quema) {
        if (this.poetaQuemaId) {
          await this.participantesService.updateParticipante(this.poetaQuemaId, { nombre: poeta_quema });
        } else {
          const { data: qData } = await this.participantesService.addParticipantes([{
            evento_id: this.eventId,
            nombre: poeta_quema,
            orden: 0
          }]);
          if (qData && (qData as any).length > 0) {
            this.poetaQuemaId = (qData as any)[0].id;
          }
        }
      }

      // 3. Separar participantes nuevos y existentes
      const newParts = participantes
        .filter((p: any) => !p.id || p.id === null)
        .map((p: any) => {
          const { id, ...data } = p;
          return {
            ...data,
            evento_id: this.eventId
          };
        });

      const existingParts = participantes.filter((p: any) => p.id && p.id !== null);

      // 4. Insertar nuevos participantes
      if (newParts.length > 0) {
        const { error: partError } = await this.participantesService.addParticipantes(newParts);
        if (partError) {
          alert('Error al guardar nuevos participantes: ' + partError.message);
        }
      }

      // 5. Actualizar participantes existentes
      if (existingParts.length > 0) {
        for (const p of existingParts) {
          await this.participantesService.updateParticipante(p.id, {
            nombre: p.nombre,
            orden: p.orden
          });
        }
      }
    }

    this.saved.emit();
  }
}

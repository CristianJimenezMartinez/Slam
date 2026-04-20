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
      color_primario: ['#92D342'],
      color_secundario: ['#368475'],
      color_fondo: ['#1A1A1A'],
      color_texto: ['#F2F2F2'],
      color_cabecera: ['#1A1A1A'],
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
        presentador: ev.presentador || 'Ágora Reix',
        artista_invitado: ev.artista_invitado || '',
        color_primario: ev.color_primario || '#92D342',
        color_secundario: ev.color_secundario || '#368475',
        color_fondo: ev.color_fondo || '#1A1A1A',
        color_texto: ev.color_texto || '#F2F2F2',
        color_cabecera: ev.color_cabecera || '#1A1A1A'
      });
      if (ev.url_cartel) {
        this.oldCartelUrl = ev.url_cartel;
        this.cartelPreview = ev.url_cartel;
      }

      const resParts = await lastValueFrom(this.participantesService.getParticipantesByEvento(this.eventId!));
      const parts = resParts?.data;
      (parts as any[] | null)?.forEach(p => {
        this.participantes.push(this.fb.group({
          id: [p.id],
          nombre: [p.nombre, Validators.required],
          orden: [p.orden]
        }));
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

    const { nombre, descripcion, fecha, url_entradas, url_cartel, presentador, artista_invitado, participantes, color_primario, color_secundario, color_fondo, color_texto, color_cabecera } = this.eventForm.value;
    
    // Convertir el string local a una fecha ISO real con su zona horaria antes de enviar a Supabase
    const fechaISO = new Date(fecha).toISOString();

    const eventoData = { nombre, descripcion, fecha: fechaISO, url_entradas, url_cartel, presentador, artista_invitado, color_primario, color_secundario, color_fondo, color_texto, color_cabecera };

    let res;
    if (this.eventId) {
      res = await this.eventosService.updateEvento(this.eventId, eventoData);
    } else {
      res = await this.eventosService.createEvento(eventoData);
      this.eventId = (res.data as any).id;
    }

    if (this.eventId) {
      const newParts = participantes
        .filter((p: any) => !p.id || p.id === null)
        .map((p: any) => {
          const { id, ...data } = p;
          return {
            ...data,
            evento_id: this.eventId
          };
        });

      if (newParts.length > 0) {
        const { error: partError } = await this.participantesService.addParticipantes(newParts);
        if (partError) {
          alert('Error al guardar participantes: ' + partError.message);
        }
      }
    }

    this.saved.emit();
  }
}

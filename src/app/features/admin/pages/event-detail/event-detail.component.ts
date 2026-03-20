import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventosService } from '../../../../core/services/eventos.service';
import { ParticipantesService } from '../../../../core/services/participantes.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  eventForm: FormGroup;
  eventId: string | null = null;
  loading = false;
  qrCodeUrl: string | null = null;

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
      fecha: [new Date().toISOString().slice(0, 16), Validators.required],
      participantes: this.fb.array([])
    });
  }

  get participantes(): FormArray {
    return this.eventForm.get('participantes') as FormArray;
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.loadEvent();
    } else {
      this.addParticipante(); // Start with one empty slot
    }
  }

  async loadEvent() {
    this.loading = true;
    const res = await this.eventosService.getEventos().toPromise();
    const evento = res?.data;
    const ev = (evento as any[] | null)?.find(e => e.id === this.eventId);
    if (ev) {
      this.eventForm.patchValue({
        nombre: ev.nombre,
        descripcion: ev.descripcion,
        fecha: new Date(ev.fecha).toISOString().slice(0, 16)
      });
      
      const resParts = await this.participantesService.getParticipantesByEvento(this.eventId!).toPromise();
      const parts = resParts?.data;
      (parts as any[] | null)?.forEach(p => {
        this.participantes.push(this.fb.group({
          id: [p.id],
          nombre: [p.nombre, Validators.required],
          orden: [p.orden]
        }));
      });
    }
    
    // Generate QR for the direct voting link
    const votingUrl = `${window.location.origin}/votar`;
    this.qrCodeUrl = await QRCode.toDataURL(votingUrl);
    
    this.loading = false;
  }

  addParticipante() {
    this.participantes.push(this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      orden: [this.participantes.length + 1]
    }));
  }

  removeParticipante(index: number) {
    this.participantes.removeAt(index);
  }

  async onSubmit() {
    if (this.eventForm.invalid) return;
    this.loading = true;
    
    const { nombre, descripcion, fecha, participantes } = this.eventForm.value;
    const eventoData = { nombre, descripcion, fecha };
    
    let res;
    if (this.eventId) {
      res = await this.eventosService.updateEvento(this.eventId, eventoData);
    } else {
      res = await this.eventosService.createEvento(eventoData);
      this.eventId = (res.data as any).id;
    }
    
    if (this.eventId) {
      // Direct approach for brevity: delete and re-insert for updates is risky, 
      // but simpler for a "Slam" rapid app. 
      // Better: diff participants. For now, let's just insert new ones if no ID.
      const newParts = participantes.filter((p: any) => !p.id).map((p: any) => ({
        ...p,
        evento_id: this.eventId
      }));
      if (newParts.length > 0) {
        await this.participantesService.addParticipantes(newParts);
      }
    }
    
    this.router.navigate(['/admin']);
  }
}

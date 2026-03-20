import { Component, OnInit } from '@angular/core';
import { EventosService, Evento } from '../../../../core/services/eventos.service';
import { ParticipantesService, Participante } from '../../../../core/services/participantes.service';
import { VotacionesService } from '../../../../core/services/votaciones.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-votar',
  templateUrl: './votar.component.html',
  styleUrls: ['./votar.component.scss']
})
export class VotarComponent implements OnInit {
  evento: Evento | null = null;
  participantes: any[] = [];
  voteForm: FormGroup;
  loading = true;
  submitted = false;
  error: string | null = null;
  voterToken: string;

  constructor(
    private fb: FormBuilder,
    private eventosService: EventosService,
    private participantesService: ParticipantesService,
    private votacionesService: VotacionesService
  ) {
    this.voteForm = this.fb.group({
      puntuaciones: this.fb.array([])
    });
    
    // Device-based voter token (doesn't block others on the same IP/WiFi)
    let token = localStorage.getItem('voter_token');
    if (!token) {
      token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('voter_token', token);
    }
    this.voterToken = token;
  }

  get puntuaciones(): FormArray {
    return this.voteForm.get('puntuaciones') as FormArray;
  }

  ngOnInit(): void {
    this.loadActiveEvent();
  }

  async loadActiveEvent() {
    this.loading = true;
    try {
      const res = await this.eventosService.getEventoActivo().toPromise();
      this.evento = res || null;
      if (this.evento) {
        const resParts = await this.participantesService.getParticipantesByEvento(this.evento.id).toPromise();
        this.participantes = resParts?.data || [];
        
        this.participantes.forEach(() => {
          this.puntuaciones.push(this.fb.control(5, [Validators.required, Validators.min(1), Validators.max(10)]));
        });
      }
    } catch (e) {
      this.error = 'No se pudo cargar el evento activo.';
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (this.voteForm.invalid || !this.evento) return;
    this.loading = true;
    
    const votes = this.participantes.map((p, i) => ({
      evento_id: this.evento!.id,
      participante_id: p.id,
      puntuacion: this.puntuaciones.at(i).value,
      voter_token: this.voterToken
    }));
    
    const { error } = await this.votacionesService.submitVotaciones(votes);
    if (error) {
      if (error.code === '23505') {
        this.error = 'Ya has votado en este evento.';
      } else {
        this.error = 'Error al enviar tus votos. Inténtalo de nuevo.';
      }
    } else {
      this.submitted = true;
    }
    this.loading = false;
  }
}

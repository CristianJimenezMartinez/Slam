import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { EventosService, Evento } from '../../core/services/eventos.service';
import { ParticipantesService, Participante } from '../../core/services/participantes.service';
import { VotacionesService } from '../../core/services/votaciones.service';
import { SeoService } from '../../core/services/seo.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-votar',
  templateUrl: './votar.component.html',
  styleUrls: ['./votar.component.scss']
})
export class VotarComponent implements OnInit, OnDestroy {
  evento: Evento | null = null;
  participantes: Participante[] = [];
  poetaActivo: Participante | null = null;
  
  voteForm: FormGroup;
  loading = true;
  error: string | null = null;
  voterToken: string;
  
  votosGuardados: string[] = [];
  resultados: any[] = [];
  private eventoSub: Subscription | any = null;

  opcionesVoto = [
    { valor: 2, texto: 'Suave' },
    { valor: 4, texto: 'Bien' },
    { valor: 6, texto: 'Fuerte' },
    { valor: 8, texto: 'Fuego' },
    { valor: 10, texto: 'Magia' }
  ];

  constructor(
    private fb: FormBuilder,
    private eventosService: EventosService,
    private participantesService: ParticipantesService,
    private votacionesService: VotacionesService,
    private seo: SeoService,
    private ngZone: NgZone
  ) {
    this.voteForm = this.fb.group({
      puntuacion: [null, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
    
    let token = localStorage.getItem('voter_token');
    if (!token) {
      token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('voter_token', token);
    }
    this.voterToken = token;

    const saved = localStorage.getItem('votos_guardados');
    if (saved) {
      this.votosGuardados = JSON.parse(saved);
    }
  }

  get puntuacion(): FormControl {
    return this.voteForm.get('puntuacion') as FormControl;
  }

  get yaVotadoAlPoetaActivo(): boolean {
    if (!this.poetaActivo) return false;
    return this.votosGuardados.includes(this.poetaActivo.id!);
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
        this.seo.setPage({
          title: `Votar – ${this.evento.nombre}`,
          description: `Participa con tu voto en ${this.evento.nombre}. Poetry Slam Alicante – Tu voz cuenta.`,
          path: '/votar'
        });

        const resParts = await this.participantesService.getParticipantesByEvento(this.evento.id).toPromise();
        this.participantes = (resParts?.data || []) as Participante[];
        
        this.procesarEstadoEvento();

        // Suscribirse a cambios en tiempo real
        this.eventoSub = this.eventosService.listenToEventoChanges(this.evento.id, (payload: any) => {
          this.ngZone.run(() => {
            if (payload.new) {
              this.evento = { ...this.evento, ...payload.new } as Evento;
              this.procesarEstadoEvento();
            }
          });
        });

      } else {
        this.seo.setPage({
          title: 'Votar',
          description: 'Participa con tu voto en el Poetry Slam Alicante. Tu voz cuenta.',
          path: '/votar'
        });
      }
    } catch (e) {
      this.error = 'No se pudo cargar el evento activo.';
    } finally {
      this.loading = false;
    }
  }

  procesarEstadoEvento() {
    if (!this.evento) return;

    if (!this.evento.votacion_activa) {
      this.poetaActivo = null;
      this.cargarResultados();
      return;
    }

    if (!this.evento.participante_activo_id) {
      this.poetaActivo = null;
      this.cargarResultados();
      return;
    }

    const nuevoPoetaActivo = this.participantes.find(p => p.id === this.evento!.participante_activo_id) || null;
    
    // Si cambia el poeta activo a uno nuevo, resetear el formulario a null
    if (nuevoPoetaActivo && (!this.poetaActivo || this.poetaActivo.id !== nuevoPoetaActivo.id)) {
       this.puntuacion.setValue(null);
       this.error = null;
    }

    this.poetaActivo = nuevoPoetaActivo;
  }

  async cargarResultados() {
    if (!this.evento) return;
    const { data } = await this.votacionesService.getResultados(this.evento.id).toPromise();
    this.resultados = data || [];
  }

  async onSubmit() {
    if (this.voteForm.invalid || !this.evento || !this.poetaActivo) return;
    this.loading = true;
    this.error = null;
    
    const vote = [{
      evento_id: this.evento.id,
      participante_id: this.poetaActivo.id!,
      puntuacion: this.puntuacion.value,
      voter_token: this.voterToken
    }];
    
    const { error } = await this.votacionesService.submitVotaciones(vote);
    if (error) {
      if (error.code === '23505') {
        this.error = 'Ya has votado a este poeta.';
        this.guardarVotoLocal(this.poetaActivo.id!);
      } else {
        this.error = 'Error al enviar tu voto. Inténtalo de nuevo.';
      }
    } else {
      this.guardarVotoLocal(this.poetaActivo.id!);
    }
    this.loading = false;
  }

  private guardarVotoLocal(participanteId: string) {
    if (!this.votosGuardados.includes(participanteId)) {
      this.votosGuardados.push(participanteId);
      localStorage.setItem('votos_guardados', JSON.stringify(this.votosGuardados));
    }
  }

  ngOnDestroy() {
    if (this.eventoSub) {
      this.eventoSub.unsubscribe();
    }
  }
}

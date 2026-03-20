import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from } from 'rxjs';

export interface Participante {
  id: string;
  evento_id: string;
  nombre: string;
  orden: number;
}

@Injectable({
  providedIn: 'root',
})
export class ParticipantesService {
  constructor(private supa: SupabaseService) {}

  getParticipantesByEvento(eventoId: string) {
    return from(
      this.supa.client
        .from('participantes')
        .select('*')
        .eq('evento_id', eventoId)
        .order('orden', { ascending: true })
    );
  }

  async addParticipantes(participantes: Partial<Participante>[]) {
    return this.supa.client.from('participantes').insert(participantes);
  }

  async deleteParticipante(id: string) {
    return this.supa.client.from('participantes').delete().eq('id', id);
  }
}

import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from as fromRxjs } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Participante {
  id: string;
  evento_id: string;
  nombre: string;
  orden: number;
  foto_url?: string;
  esta_votando?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ParticipantesService {
  constructor(private supa: SupabaseService) {}

  getParticipantesByEvento(eventoId: string) {
    return fromRxjs(
      this.supa.client
        .from('participantes')
        .select('*')
        .eq('evento_id', eventoId)
        .order('orden', { ascending: true })
    ).pipe(
      map(res => {
        if (res.data) {
          res.data = res.data.map((p: any) => {
            if (!p.foto_url) {
              // Asignación automática: Poeta 1 a 10 según su orden
              const avatarIndex = p.orden === 0 ? 10 : (((p.orden - 1) % 10) + 1);
              p.foto_url = `assets/images/avatars/poeta${avatarIndex}.png`;
            }
            return p;
          });
        }
        return res;
      })
    );
  }

  async addParticipantes(participantes: Partial<Participante>[]) {
    return this.supa.client.from('participantes').insert(participantes);
  }

  async deleteParticipante(id: string) {
    return this.supa.client.from('participantes').delete().eq('id', id);
  }

  async updateParticipante(id: string, data: Partial<Participante>) {
    return this.supa.client.from('participantes').update(data).eq('id', id);
  }
}

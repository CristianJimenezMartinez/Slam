import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Votacion {
  id: string;
  evento_id: string;
  participante_id: string;
  puntuacion: number;
  voter_token: string;
  ronda: number;
}

export interface Resultado {
  participante_id: string;
  participante: string;
  orden: number;
  evento_id: string;
  evento: string;
  num_votos: number;
  puntuacion_total: number;
  puntuacion_media: number;
  posicion: number;
  ronda: number;
  foto_url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VotacionesService {
  constructor(private supa: SupabaseService) {}

  async submitVotaciones(votaciones: Partial<Votacion>[]) {
    return this.supa.client.from('votaciones').insert(votaciones);
  }

  getResultados(eventoId: string, ronda?: number): Observable<any> {
    let query = this.supa.client
      .from('resultados' as any)
      .select('*')
      .eq('evento_id', eventoId);
    
    if (ronda) {
      query = query.eq('ronda', ronda);
    }

    return from(query.order('posicion', { ascending: true })).pipe(
      map(res => {
        if (res.data) {
          res.data = res.data.map((r: any) => {
            if (!r.foto_url) {
              // Misma lógica de asignación que en ParticipantesService
              const avatarIndex = r.orden === 0 ? 10 : (((r.orden - 1) % 10) + 1);
              r.foto_url = `assets/images/avatars/poeta${avatarIndex}.png`;
            }
            return r;
          });
        }
        return res;
      })
    );
  }

  listenToVotaciones(eventoId: string, callback: (payload: any) => void) {
    return this.supa.client
      .channel('public:votaciones')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votaciones', filter: `evento_id=eq.${eventoId}` },
        callback
      )
      .subscribe();
  }
}

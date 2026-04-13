import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from, Observable } from 'rxjs';

export interface Votacion {
  id: string;
  evento_id: string;
  participante_id: string;
  puntuacion: number;
  voter_token: string;
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

  getResultados(eventoId: string): Observable<any> {
    return from(
      this.supa.client
        .from('resultados' as any)
        .select('*')
        .eq('evento_id', eventoId)
        .order('posicion', { ascending: true })
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

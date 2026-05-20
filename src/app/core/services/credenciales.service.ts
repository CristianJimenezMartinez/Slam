import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from, Observable } from 'rxjs';

export interface CredencialVoto {
  id: string;
  evento_id: string;
  voter_token?: string;
  utilizada: boolean;
  activated_at?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class CredencialesService {
  constructor(private supa: SupabaseService) {}

  // Genera N credenciales en base de datos para un Slam específico
  async generarCredenciales(eventoId: string, cantidad: number) {
    const credenciales = Array.from({ length: cantidad }, () => ({
      evento_id: eventoId,
      utilizada: false
    }));
    return this.supa.client.from('credenciales_voto').insert(credenciales).select();
  }

  // Lista todas las credenciales generadas para un evento
  getCredencialesByEvento(eventoId: string): Observable<any> {
    return from(
      this.supa.client
        .from('credenciales_voto')
        .select('*')
        .eq('evento_id', eventoId)
        .order('created_at', { ascending: true })
    );
  }

  // Llama a la función transaccional en la DB
  async activarCredencial(credencialId: string, voterToken: string) {
    return this.supa.client.rpc('activar_credencial', {
      p_credencial_id: credencialId,
      p_voter_token: voterToken
    });
  }

  // Elimina las credenciales generadas de un evento (para reseteo)
  async borrarCredenciales(eventoId: string) {
    return this.supa.client.from('credenciales_voto').delete().eq('evento_id', eventoId);
  }
}

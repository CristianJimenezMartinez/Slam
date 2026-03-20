import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Evento {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  activo: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventosService {
  constructor(private supa: SupabaseService) {}

  getEventos() {
    return from(this.supa.client.from('eventos').select('*').order('fecha', { ascending: false }));
  }

  getEventoActivo() {
    return from(this.supa.client.from('eventos').select('*').eq('activo', true).single()).pipe(
      map(res => res.data as Evento | null)
    );
  }

  async createEvento(evento: Partial<Evento>) {
    return this.supa.client.from('eventos').insert(evento).select().single();
  }

  async updateEvento(id: string, updates: Partial<Evento>) {
    return this.supa.client.from('eventos').update(updates).eq('id', id);
  }

  async deleteEvento(id: string) {
    return this.supa.client.from('eventos').delete().eq('id', id);
  }

  async setActivo(id: string) {
    // First deactivate all
    await this.supa.client.from('eventos').update({ activo: false }).neq('id', id);
    // Then activate one
    return this.supa.client.from('eventos').update({ activo: true }).eq('id', id);
  }

  async deactivateAll() {
    return this.supa.client.from('eventos').update({ activo: false }).not('id', 'is', null);
  }
}

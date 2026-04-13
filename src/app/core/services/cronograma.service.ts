import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from as fromRxjs } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Cronograma {
  id: string;
  fecha: string;
  nombre: string;
  url_entradas?: string;
  url_foto?: string;
  ubicacion?: string;
  edicion?: string;
  url_pase_temporada?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class CronogramaService {
  constructor(private supa: SupabaseService) {}

  getCronograma() {
    return fromRxjs(
      this.supa.client
        .from('cronograma')
        .select('*')
        .order('fecha', { ascending: true })
    );
  }

  async createCronograma(item: Partial<Cronograma>) {
    return this.supa.client.from('cronograma').insert(item).select().single();
  }

  async updateCronograma(id: string, updates: Partial<Cronograma>) {
    return this.supa.client.from('cronograma').update(updates).eq('id', id);
  }

  async updateGlobalSettings(updates: { url_foto?: string; edicion?: string; url_pase_temporada?: string }) {
    // Actualizamos todas las filas con los campos globales
    return this.supa.client.from('cronograma').update(updates).not('id', 'is', null);
  }

  async deleteCronograma(id: string) {
    return this.supa.client.from('cronograma').delete().eq('id', id);
  }
}

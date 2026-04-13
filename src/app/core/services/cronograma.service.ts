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

  async updateSeasonPhoto(url: string) {
    // Actualizamos todas las filas con la misma foto
    return this.supa.client.from('cronograma').update({ url_foto: url }).not('id', 'is', null);
  }

  async deleteCronograma(id: string) {
    return this.supa.client.from('cronograma').delete().eq('id', id);
  }
}

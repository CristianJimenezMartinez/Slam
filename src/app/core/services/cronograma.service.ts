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
  color_primario?: string;
  color_secundario?: string;
  color_fondo?: string;
  color_texto?: string;
  color_cabecera?: string;
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

  async updateGlobalSettings(updates: Partial<Cronograma>) {
    // Actualizamos todas las filas con los campos globales (quitando el ID si viene)
    const { id, created_at, ...data } = updates as any;
    return this.supa.client.from('cronograma').update(data).not('id', 'is', null);
  }

  async deleteCronograma(id: string) {
    return this.supa.client.from('cronograma').delete().eq('id', id);
  }
}

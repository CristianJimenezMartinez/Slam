import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from as fromRxjs } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface Evento {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  activo: boolean;
  created_at: string;
  url_entradas?: string;
  url_cartel?: string;
  presentador?: string;
  artista_invitado?: string;
  votacion_activa?: boolean;
  color_primario?: string;
  color_secundario?: string;
  color_fondo?: string;
  color_texto?: string;
  color_cabecera?: string;
  pin_sesion?: string;
  registro_pin_abierto?: boolean;
  votos_totales_registrados?: number;
  participante_activo_id?: string;
  puntuaciones_activas?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EventosService {
  constructor(private supa: SupabaseService) {}

  getEventos() {
    return fromRxjs(this.supa.client.from('eventos').select('*').order('fecha', { ascending: false }));
  }

  getEventoActivo() {
    // 1. Intentamos obtener el evento marcado manualmente como activo
    return fromRxjs(this.supa.client.from('eventos').select('*').eq('activo', true).maybeSingle()).pipe(
      map(res => res.data as Evento | null),
      switchMap(manualActive => {
        if (manualActive) return [manualActive];
        
        // 2. Si no hay ninguno activo manualmente, buscamos el más próximo en el futuro
        const today = new Date().toISOString();
        return fromRxjs(
          this.supa.client
            .from('eventos')
            .select('*')
            .gte('fecha', today)
            .order('fecha', { ascending: true })
            .limit(1)
            .maybeSingle()
        ).pipe(
          map(res => res.data as Evento | null)
        );
      })
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

  async toggleVotacion(id: string, estado: boolean) {
    return this.supa.client.from('eventos').update({ votacion_activa: estado }).eq('id', id);
  }

  async setParticipanteActivo(eventoId: string, participanteId: string | null) {
    return this.supa.client.from('eventos').update({ participante_activo_id: participanteId }).eq('id', eventoId);
  }

  async togglePuntuacionesVisibles(id: string, estado: boolean) {
    return this.supa.client.from('eventos').update({ puntuaciones_activas: estado }).eq('id', id);
  }

  listenToEventoChanges(eventoId: string, callback: (payload: any) => void) {
    const channelName = `evento_${eventoId}_${Math.random().toString(36).substring(7)}`;
    return this.supa.client
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'eventos', filter: `id=eq.${eventoId}` },
        callback
      )
      .subscribe();
  }

  listenToAllEventosChanges(callback: (payload: any) => void) {
    const channelName = `all_eventos_${Math.random().toString(36).substring(7)}`;
    return this.supa.client
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos' },
        callback
      )
      .subscribe();
  }

  async uploadCartel(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${new Date().getTime()}.${fileExt}`;
    
    const { error } = await this.supa.client.storage.from('carteles').upload(fileName, file);
    if (error) {
      console.error('Error al subir cartel:', error.message);
      return null;
    }
    const { data } = this.supa.client.storage.from('carteles').getPublicUrl(fileName);
    return data.publicUrl;
  }

  async listCarteles() {
    const { data, error } = await this.supa.client.storage.from('carteles').list();
    if (error || !data) {
      console.error('Error al listar carteles:', error?.message);
      return [];
    }
    const files = data.filter(f => f.name && f.name !== '.emptyFolderPlaceholder');
    return files.map(f => {
      const { data: urlData } = this.supa.client.storage.from('carteles').getPublicUrl(f.name);
      return { name: f.name, url: urlData.publicUrl };
    });
  }

  async deleteCartel(url: string) {
    if (!url) return;
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      if (fileName) {
        await this.supa.client.storage.from('carteles').remove([fileName]);
      }
    } catch (e) {
      console.error('Error al borrar el cartel antiguo:', e);
    }
  }
}

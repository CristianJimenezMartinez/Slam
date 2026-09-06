import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SlamEdicion } from '../models/edicion.model';
import { EDICIONES_SNAPSHOT } from '../data/ediciones-snapshot';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class EdicionesService {
  private ediciones$ = new BehaviorSubject<SlamEdicion[]>(EDICIONES_SNAPSHOT);

  constructor(private supa: SupabaseService) {
    this.sincronizarConSupabase();
  }

  /**
   * Obtiene la lista completa de ediciones catalogadas
   */
  getEdiciones(): Observable<SlamEdicion[]> {
    return this.ediciones$.asObservable();
  }

  /**
   * Obtiene una edición específica por su número correlativo de encuentro (1 a 6)
   */
  getEdicionByNumero(numero: number): SlamEdicion | undefined {
    return this.ediciones$.value.find(e => e.numero === numero);
  }

  /**
   * Obtiene una edición por su UUID de base de datos
   */
  getEdicionById(id: string): SlamEdicion | undefined {
    return this.ediciones$.value.find(e => e.id === id);
  }

  /**
   * Lista las temporadas disponibles en el archivo
   */
  getTemporadas(): string[] {
    const temporadas = this.ediciones$.value.map(e => e.temporada);
    return Array.from(new Set(temporadas));
  }

  /**
   * Sincronización en segundo plano con la base de datos Supabase
   * Mejora cualquier dato actualizado sin bloquear el renderizado instantáneo.
   */
  private async sincronizarConSupabase(): Promise<void> {
    try {
      const { data: eventos, error } = await this.supa.client
        .from('eventos')
        .select('*')
        .order('fecha', { ascending: true });

      if (error || !eventos || eventos.length === 0) {
        return;
      }

      // Mapear y enriquecer el snapshot con cualquier dato actualizado de BD
      const snapshotActualizado = this.ediciones$.value.map(edicion => {
        const eventoBd = eventos.find(ev => ev.id === edicion.id);
        if (!eventoBd) return edicion;

        return {
          ...edicion,
          urlCartel: eventoBd.url_cartel || edicion.urlCartel,
          presentador: eventoBd.presentador || edicion.presentador,
          artistaInvitado: eventoBd.artista_invitado || edicion.artistaInvitado,
          ubicacion: eventoBd.ubicacion || edicion.ubicacion
        };
      });

      this.ediciones$.next(snapshotActualizado);
    } catch (err) {
      // Si falla la red o Supabase, el snapshot local garantiza 100% de disponibilidad
      console.warn('EdicionesService: usando snapshot local autónomo');
    }
  }
}

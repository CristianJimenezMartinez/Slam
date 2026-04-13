import { Injectable, NgZone } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from as fromRxjs } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase!: SupabaseClient;

  constructor(private ngZone: NgZone) {
    const isValidUrl = environment.supabaseUrl && environment.supabaseUrl.startsWith('http');
    
    if (isValidUrl) {
      // Inicializamos FUERA de la zona de Angular para que zone.js
      // no intercepte las promesas del Navigator LockManager.
      this.ngZone.runOutsideAngular(() => {
        this.supabase = createClient(
          environment.supabaseUrl,
          environment.supabaseAnonKey,
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
              flowType: 'pkce',
              storageKey: 'slam-session-v1'
            }
          }
        );
      });
    } else {
      console.error('⚠️ [SupabaseService] No se ha configurado una URL válida de Supabase.');
      console.warn('Por favor, configura SUPABASE_URL y SUPABASE_ANON_KEY en tus variables de entorno o en environment.ts.');
      // Robust mock to prevent crashes in AuthService and components
      this.supabase = {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        },
        from: () => ({
          select: () => ({ 
            order: () => fromRxjs([]), 
            eq: () => ({ single: () => fromRxjs([{ data: null, error: null }]) }) 
          }),
          insert: () => ({ select: () => ({ single: () => fromRxjs([{ data: null, error: null }]) }) }),
          update: () => ({ eq: () => fromRxjs([]) }),
          delete: () => ({ eq: () => fromRxjs([]) })
        })
      } as any;
    }
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  get auth() {
    return this.supabase.auth;
  }

  from(table: string) {
    return this.supabase.from(table);
  }

  storage(bucket: string) {
    return this.supabase.storage.from(bucket);
  }

  functions() {
    return this.supabase.functions;
  }
}

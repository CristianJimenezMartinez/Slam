import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const isValidUrl = environment.supabaseUrl && environment.supabaseUrl.startsWith('http');
    
    if (isValidUrl) {
      this.supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseAnonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: 'slam-auth-token'
          }
        }
      );
    } else {
      console.error('⚠️ [SupabaseService] No se ha configurado una URL válida de Supabase.');
      console.warn('Por favor, configura SUPABASE_URL y SUPABASE_ANON_KEY en tus variables de entorno.');
      // Initialize with empty client to avoid absolute null pointer, but it will fail on calls gracefully
      this.supabase = {} as any;
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

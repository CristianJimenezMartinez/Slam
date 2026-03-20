import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private sessionSubject = new BehaviorSubject<Session | null>(null);
  session$: Observable<Session | null> = this.sessionSubject.asObservable();

  constructor(private supa: SupabaseService, private router: Router) {
    // Restore existing session
    this.supa.auth.getSession().then(({ data }) => {
      this.sessionSubject.next(data.session);
    });

    // Listen for auth events
    this.supa.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        this.sessionSubject.next(session);
        if (event === 'SIGNED_OUT') {
          this.router.navigate(['/auth/login']);
        }
      }
    );
  }

  get currentUser(): User | null {
    return this.sessionSubject.value?.user ?? null;
  }

  get isLoggedIn(): boolean {
    return !!this.sessionSubject.value;
  }

  async signUp(email: string, password: string) {
    return this.supa.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    return this.supa.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supa.auth.signOut();
  }

  async resetPassword(email: string) {
    return this.supa.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  }
}

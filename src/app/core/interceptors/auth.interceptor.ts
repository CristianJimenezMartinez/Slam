import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private supa: SupabaseService) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return from(this.supa.auth.getSession()).pipe(
      switchMap(({ data }) => {
        const token = data.session?.access_token;
        if (token) {
          req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          });
        }
        return next.handle(req);
      })
    );
  }
}

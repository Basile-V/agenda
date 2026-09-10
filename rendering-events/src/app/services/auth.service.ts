import { computed, Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, of, tap } from 'rxjs';
import { LoginCredentials, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:8080/api/auth';

  private readonly _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  login(credentials: LoginCredentials): Observable<User> {
    return this.http
      .post<User>(`${this.url}/login`, credentials, { withCredentials: true })
      .pipe(tap((user) => this._currentUser.set(user)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.url}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this._currentUser.set(null)));
  }

  restoreSession(): Observable<User | null> {
    return this.http.get<User>(`${this.url}/me`, { withCredentials: true }).pipe(
      tap((user) => this._currentUser.set(user)),
      catchError(() => {
        this._currentUser.set(null);
        return of(null);
      }),
    );
  }

  refresh(): Observable<void> {
    return this.http.post<void>(`${this.url}/refresh`, {}, { withCredentials: true });
  }
}

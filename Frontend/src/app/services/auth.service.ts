import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, of, tap } from 'rxjs';
import { LoginCredentials, RegisterCredentials, User } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/api/auth`;

  private readonly _currentUser = signal<User | null>(null);
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isAuthenticated = computed(() => this._currentUser() !== null);

  public login(credentials: LoginCredentials): Observable<User> {
    return this.http
      .post<User>(`${this.url}/login`, credentials, { withCredentials: true })
      .pipe(tap((user) => this._currentUser.set(user)));
  }

  public register(credentials: RegisterCredentials): Observable<User> {
    return this.http
      .post<User>(`${this.url}/register`, credentials, { withCredentials: true })
      .pipe(tap((user) => this._currentUser.set(user)));
  }

  public logout(): Observable<void> {
    return this.http
      .post<void>(`${this.url}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this._currentUser.set(null)));
  }

  public restoreSession(): Observable<User | null> {
    return this.http.get<User>(`${this.url}/me`, { withCredentials: true }).pipe(
      tap((user) => this._currentUser.set(user)),
      catchError(() => {
        this._currentUser.set(null);
        return of(null);
      }),
    );
  }

  public refresh(): Observable<void> {
    return this.http.post<void>(`${this.url}/refresh`, {}, { withCredentials: true });
  }
}

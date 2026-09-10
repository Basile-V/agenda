import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let refreshInProgress$: Observable<void> | null = null;

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      if (!refreshInProgress$) {
        refreshInProgress$ = authService.refresh().pipe(
          finalize(() => (refreshInProgress$ = null)),
          shareReplay(1),
        );
      }

      return refreshInProgress$.pipe(switchMap(() => next(req)));
    }),
  );
};

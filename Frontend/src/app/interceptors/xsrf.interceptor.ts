import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const XSRF_COOKIE_NAME = 'XSRF-TOKEN';
const XSRF_HEADER_NAME = 'X-XSRF-TOKEN';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const xsrfInterceptor: HttpInterceptorFn = (req, next) => {
  if (!MUTATING_METHODS.has(req.method)) {
    return next(req);
  }

  const tokenBeforeRequest = readCookie(XSRF_COOKIE_NAME);

  return next(withXsrfHeader(req, tokenBeforeRequest)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 403) {
        return throwError(() => error);
      }
      // A rejected request still refreshes the XSRF-TOKEN cookie server-side (see CsrfCookieFilter);
      // retry once if that refresh actually changed the token, otherwise this is a genuine 403.
      const tokenAfterFailure = readCookie(XSRF_COOKIE_NAME);
      if (!tokenAfterFailure || tokenAfterFailure === tokenBeforeRequest) {
        return throwError(() => error);
      }
      return next(withXsrfHeader(req, tokenAfterFailure));
    }),
  );
};

function withXsrfHeader(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token ? req.clone({ setHeaders: { [XSRF_HEADER_NAME]: token } }) : req;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { defer, finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

// The free-tier backend sleeps when idle: only requests slower than this delay show the loader,
// so that a normal (warm) response never makes it flash.
export const SLOW_REQUEST_DELAY_MS = 2000;

export const slowRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  return defer(() => {
    let flaggedAsSlow = false;
    const timeoutId = setTimeout(() => {
      flaggedAsSlow = true;
      loadingService.startSlowRequest();
    }, SLOW_REQUEST_DELAY_MS);

    return next(req).pipe(
      finalize(() => {
        clearTimeout(timeoutId);
        if (flaggedAsSlow) {
          loadingService.endSlowRequest();
        }
      }),
    );
  });
};

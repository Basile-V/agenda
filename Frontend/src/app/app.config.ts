import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';

import { routes } from './app.routes';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';
import { xsrfInterceptor } from './interceptors/xsrf.interceptor';
import { authRefreshInterceptor } from './interceptors/auth-refresh.interceptor';
import { slowRequestInterceptor } from './interceptors/slow-request.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withXhr(),
      withInterceptors([
        slowRequestInterceptor,
        credentialsInterceptor,
        xsrfInterceptor,
        authRefreshInterceptor,
      ]),
    ),
  ],
};

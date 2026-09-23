import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';
import { xsrfInterceptor } from './interceptors/xsrf.interceptor';
import { authRefreshInterceptor } from './interceptors/auth-refresh.interceptor';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withXhr(),
      withInterceptors([credentialsInterceptor, xsrfInterceptor, authRefreshInterceptor]),
    ),
    provideAppInitializer(() => firstValueFrom(inject(AuthService).restoreSession())),
  ],
};

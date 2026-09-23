import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { toDateKey } from './models/event.model';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./component/pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: () => toDateKey(new Date()) },
      {
        path: ':date',
        loadComponent: () =>
          import('./component/pages/home/home.component').then((m) => m.HomeComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

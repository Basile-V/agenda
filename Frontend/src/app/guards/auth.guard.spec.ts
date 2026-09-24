import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

const route = {} as unknown as ActivatedRouteSnapshot;
const state = {} as unknown as RouterStateSnapshot;

describe('authGuard', () => {
  let authServiceStub: {
    isAuthenticated: () => boolean;
    ensureSessionRestored: () => Observable<null>;
  };
  let router: Router;

  beforeEach(() => {
    authServiceStub = { isAuthenticated: () => false, ensureSessionRestored: () => of(null) };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceStub as unknown as AuthService },
      ],
    });
    router = TestBed.inject(Router);
  });

  function runGuard(): Promise<unknown> {
    return firstValueFrom(
      TestBed.runInInjectionContext(() => authGuard(route, state)) as Observable<unknown>,
    );
  }

  it('allows navigation when authenticated', async () => {
    authServiceStub.isAuthenticated = () => true;

    const result = await runGuard();

    expect(result).toBeTrue();
  });

  it('redirects to /login when not authenticated', async () => {
    const result = await runGuard();

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('waits for the session to be restored before deciding', async () => {
    let restored = false;
    authServiceStub.ensureSessionRestored = () =>
      new Observable<null>((subscriber) => {
        restored = true;
        subscriber.next(null);
        subscriber.complete();
      });
    authServiceStub.isAuthenticated = () => restored;

    expect(await runGuard()).toBeTrue();
  });
});

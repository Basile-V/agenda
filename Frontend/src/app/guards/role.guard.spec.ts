import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { User } from '../models/auth.model';

const route = {} as unknown as ActivatedRouteSnapshot;
const state = {} as unknown as RouterStateSnapshot;

describe('roleGuard', () => {
  let authServiceStub: { currentUser: () => User | null };
  let router: Router;

  beforeEach(() => {
    authServiceStub = { currentUser: () => null };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceStub as unknown as AuthService },
      ],
    });
    router = TestBed.inject(Router);
  });

  it('allows navigation when the user has an allowed role', () => {
    authServiceStub.currentUser = () => ({
      id: 1,
      username: 'alice',
      displayName: 'Alice',
      role: 'ADMIN',
    });

    const result = TestBed.runInInjectionContext(() => roleGuard(['ADMIN'])(route, state));

    expect(result).toBeTrue();
  });

  it('redirects to / when the user is authenticated but has a disallowed role', () => {
    authServiceStub.currentUser = () => ({
      id: 1,
      username: 'bob',
      displayName: 'Bob',
      role: 'USER',
    });

    const result = TestBed.runInInjectionContext(() => roleGuard(['ADMIN'])(route, state));

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });

  it('redirects to /login when there is no authenticated user', () => {
    const result = TestBed.runInInjectionContext(() => roleGuard(['ADMIN'])(route, state));

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});

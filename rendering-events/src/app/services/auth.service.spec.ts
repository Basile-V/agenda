import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { AuthService } from './auth.service';
import { User } from '../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const user: User = { id: 1, username: 'alice', displayName: 'Alice', role: 'USER' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('login sets currentUser and sends credentials with withCredentials', (done) => {
    service.login({ username: 'alice', password: 'secret' }).subscribe(() => {
      expect(service.currentUser()).toEqual(user);
      expect(service.isAuthenticated()).toBeTrue();
      done();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(user);
  });

  it('restoreSession sets currentUser on success', (done) => {
    service.restoreSession().subscribe((result) => {
      expect(result).toEqual(user);
      expect(service.currentUser()).toEqual(user);
      done();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/me');
    req.flush(user);
  });

  it('restoreSession clears currentUser on 401', (done) => {
    service.restoreSession().subscribe((result) => {
      expect(result).toBeNull();
      expect(service.currentUser()).toBeNull();
      done();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/me');
    req.flush('unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('logout clears currentUser', (done) => {
    service.login({ username: 'alice', password: 'secret' }).subscribe(() => {
      service.logout().subscribe(() => {
        expect(service.currentUser()).toBeNull();
        done();
      });

      const logoutReq = httpMock.expectOne('http://localhost:8080/api/auth/logout');
      logoutReq.flush(null);
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush(user);
  });
});

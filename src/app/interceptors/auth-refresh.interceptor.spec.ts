import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authRefreshInterceptor } from './auth-refresh.interceptor';

describe('authRefreshInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr(), withInterceptors([authRefreshInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('refreshes the session once on 401 and retries the original request', (done) => {
    http.get('http://localhost:8080/api/events').subscribe((result) => {
      expect(result).toEqual({ ok: true });
      done();
    });

    const firstAttempt = httpMock.expectOne('http://localhost:8080/api/events');
    firstAttempt.flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne('http://localhost:8080/api/auth/refresh');
    refreshReq.flush(null);

    const retryAttempt = httpMock.expectOne('http://localhost:8080/api/events');
    retryAttempt.flush({ ok: true });
  });

  it('propagates non-401 errors without calling refresh', (done) => {
    http.get('http://localhost:8080/api/events').subscribe({
      error: (error: unknown) => {
        expect((error as { status: number }).status).toBe(500);
        done();
      },
    });

    const req = httpMock.expectOne('http://localhost:8080/api/events');
    req.flush('server error', { status: 500, statusText: 'Internal Server Error' });

    httpMock.expectNone('http://localhost:8080/api/auth/refresh');
  });
});

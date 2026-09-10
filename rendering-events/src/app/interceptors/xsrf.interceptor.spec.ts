import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { xsrfInterceptor } from './xsrf.interceptor';

describe('xsrfInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  function clearXsrfCookie(): void {
    document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  beforeEach(() => {
    document.cookie = 'XSRF-TOKEN=abc123; path=/';

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr(), withInterceptors([xsrfInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    clearXsrfCookie();
  });

  it('adds the X-XSRF-TOKEN header on mutating requests when the cookie is present', () => {
    http.post('http://localhost:8080/api/auth/logout', {}).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/logout');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('abc123');
    req.flush(null);
  });

  it('does not add the header on GET requests', () => {
    http.get('http://localhost:8080/api/events').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/events');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBeFalse();
    req.flush([]);
  });

  it('does not add the header when the cookie is absent', () => {
    clearXsrfCookie();

    http.post('http://localhost:8080/api/auth/logout', {}).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/logout');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBeFalse();
    req.flush(null);
  });
});

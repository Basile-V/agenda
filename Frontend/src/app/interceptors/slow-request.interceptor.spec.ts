import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SLOW_REQUEST_DELAY_MS, slowRequestInterceptor } from './slow-request.interceptor';
import { LoadingService } from '../services/loading.service';

describe('slowRequestInterceptor', () => {
  const url = 'http://localhost:8080/api/events';
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr(), withInterceptors([slowRequestInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('does not flag a request answered before the delay', fakeAsync(() => {
    http.get(url).subscribe();

    httpMock.expectOne(url).flush([]);
    tick(SLOW_REQUEST_DELAY_MS);

    expect(loadingService.isWaitingForServer()).toBeFalse();
  }));

  it('flags a request still pending after the delay, until it completes', fakeAsync(() => {
    http.get(url).subscribe();
    const req = httpMock.expectOne(url);

    tick(SLOW_REQUEST_DELAY_MS);
    expect(loadingService.isWaitingForServer()).toBeTrue();

    req.flush([]);
    expect(loadingService.isWaitingForServer()).toBeFalse();
  }));

  it('stops waiting when a slow request fails', fakeAsync(() => {
    http.get(url).subscribe({ error: () => undefined });
    const req = httpMock.expectOne(url);

    tick(SLOW_REQUEST_DELAY_MS);
    req.flush(null, { status: 503, statusText: 'Service Unavailable' });

    expect(loadingService.isWaitingForServer()).toBeFalse();
  }));
});

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EventService } from './event.service';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        EventService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadEvents parses startMinutes and endMinutes', (done) => {
    const mock = [{ id: 7, start: '09:30', duration: 30 }];

    service.loadEvents().subscribe((list) => {
      expect(list.length).toBeGreaterThan(0);
      const e = list[0];
      expect(e.startMinutes).toBe(9 * 60 + 30);
      expect(e.endMinutes).toBe(e.startMinutes + 30);
      done();
    });

    const req = httpMock.expectOne('assets/input.json');
    req.flush(mock);
  });
});

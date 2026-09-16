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

  it('loadEvents requests the given date and parses startMinutes and endMinutes', (done) => {
    const mock = [
      { id: 7, date: '2026-08-26', start: '09:30', duration: 30, ownerId: 2, isPublic: false },
    ];

    service.loadEvents('2026-08-26').subscribe((list) => {
      expect(list.length).toBeGreaterThan(0);
      const e = list[0];
      expect(e.startMinutes).toBe(9 * 60 + 30);
      expect(e.endMinutes).toBe(e.startMinutes + 30);
      done();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/events?date=2026-08-26');
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('createEvent posts the draft and parses the server-created event', (done) => {
    const draft = { title: 'Point équipe', date: '2026-08-26', start: '09:30', duration: 30, isPublic: true };
    const created = { id: 42, ownerId: 2, ...draft };

    service.createEvent(draft).subscribe((event) => {
      expect(event.id).toBe(42);
      expect(event.ownerId).toBe(2);
      expect(event.isPublic).toBeTrue();
      expect(event.startMinutes).toBe(9 * 60 + 30);
      done();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/events');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(draft);
    req.flush(created);
  });

  it('updateEvent puts the changes and parses the server-updated event', (done) => {
    const changes = { title: 'Point équipe renommé', date: '2026-08-27', start: '10:00', duration: 45, isPublic: true };
    const updated = { id: 42, ownerId: 2, ...changes };

    service.updateEvent(42, changes).subscribe((event) => {
      expect(event.id).toBe(42);
      expect(event.title).toBe('Point équipe renommé');
      expect(event.startMinutes).toBe(10 * 60);
      done();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/events/42');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(changes);
    req.flush(updated);
  });
});

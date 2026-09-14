import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CalendarComponent } from './calendar.component';
import { EventComponent } from '../../molecules/event/event.component';
import { EventRaw } from '../../../models/event.model';

import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('CalendarComponent (integration)', () => {
  let fixture: ComponentFixture<CalendarComponent>;
  let httpMock: HttpTestingController;

  const mockEvents: EventRaw[] = [
    { id: 1, date: '2026-08-26', start: '10:00', duration: 30, ownerId: 2, isPublic: false },
    { id: 2, date: '2026-08-26', start: '14:00', duration: 60, ownerId: 2, isPublic: true },
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CalendarComponent, EventComponent],
      providers: [
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CalendarComponent);
    fixture.componentRef.setInput('selectedDate', new Date(2026, 7, 26));
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests events for the selected date and renders them', () => {
    const req = httpMock.expectOne('http://localhost:8080/api/events?date=2026-08-26');
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);

    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement as HTMLElement;
    expect(compiled.querySelector('#event-1')).withContext('event-1 exists').not.toBeNull();
    expect(compiled.querySelector('#event-2')).withContext('event-2 exists').not.toBeNull();
  });
});

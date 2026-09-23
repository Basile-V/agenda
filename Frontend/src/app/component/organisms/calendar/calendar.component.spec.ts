import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CalendarComponent } from './calendar.component';
import { EventComponent } from '../../molecules/event/event.component';
import { EventDetailsComponent } from '../event-details/event-details.component';
import { EventRawDTO, ParsedEvent } from '../../../models/event.model';
import { AuthService } from '../../../services/auth.service';
import { EventService } from '../../../services/event.service';

import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('CalendarComponent (integration)', () => {
  let fixture: ComponentFixture<CalendarComponent>;
  let httpMock: HttpTestingController;

  const mockEventDtos: EventRawDTO[] = [
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

  it('requests events for the selected date and renders them', async () => {
    const req = httpMock.expectOne('http://localhost:8080/api/events?date=2026-08-26');
    expect(req.request.method).toBe('GET');
    req.flush(mockEventDtos);

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement as HTMLElement;
    expect(compiled.querySelector('#event-1')).withContext('event-1 exists').not.toBeNull();
    expect(compiled.querySelector('#event-2')).withContext('event-2 exists').not.toBeNull();
  });

  describe('openEventDetails', () => {
    const ownedEvent: ParsedEvent = {
      id: 1,
      date: '2026-08-26',
      start: '10:00',
      duration: 30,
      ownerId: 2,
      isPublic: false,
      startMinutes: 10 * 60,
      endMinutes: 10 * 60 + 30,
    };

    it('allows editing and updates the event when the current user owns it', () => {
      httpMock.expectOne('http://localhost:8080/api/events?date=2026-08-26').flush([]);
      const authService = TestBed.inject(AuthService);
      (authService as unknown as { currentUser: () => { id: number } }).currentUser = () => ({ id: 2 });
      const updated: ParsedEvent = { ...ownedEvent, title: 'Renommé' };
      const formValue = { title: 'Renommé', date: '2026-08-26', start: '10:00', duration: 30, isPublic: false };
      const eventService = TestBed.inject(EventService);
      const updateEventSpy = spyOn(eventService, 'updateEvent').and.returnValue(of(updated));
      const dialogRefStub = { afterClosed: () => of(formValue) };
      const dialogSpy = spyOn(fixture.componentInstance.dialog, 'open').and.returnValue(dialogRefStub as never);

      fixture.componentInstance.openEventDetails(ownedEvent);

      expect(dialogSpy).toHaveBeenCalledWith(EventDetailsComponent, {
        data: { event: ownedEvent, canEdit: true },
      });
      expect(updateEventSpy).toHaveBeenCalledWith(1, formValue);
    });

    it('keeps the event displayed with its new details when it stays on the same day', async () => {
      httpMock.expectOne('http://localhost:8080/api/events?date=2026-08-26').flush(mockEventDtos);
      await fixture.whenStable();
      fixture.detectChanges();
      const authService = TestBed.inject(AuthService);
      (authService as unknown as { currentUser: () => { id: number } }).currentUser = () => ({ id: 2 });
      const updated: ParsedEvent = { ...ownedEvent, title: 'Renommé' };
      const eventService = TestBed.inject(EventService);
      spyOn(eventService, 'updateEvent').and.returnValue(of(updated));
      const dialogRefStub = {
        afterClosed: () => of({ title: 'Renommé', date: '2026-08-26', start: '10:00', duration: 30, isPublic: false }),
      };
      spyOn(fixture.componentInstance.dialog, 'open').and.returnValue(dialogRefStub as never);

      fixture.componentInstance.openEventDetails(ownedEvent);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('#event-1')).withContext('event-1 still shown').not.toBeNull();
    });

    it('removes the event from the current view when it is moved to another day', async () => {
      httpMock.expectOne('http://localhost:8080/api/events?date=2026-08-26').flush(mockEventDtos);
      await fixture.whenStable();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#event-1')).withContext('event-1 shown before move').not.toBeNull();
      const authService = TestBed.inject(AuthService);
      (authService as unknown as { currentUser: () => { id: number } }).currentUser = () => ({ id: 2 });
      const movedEvent: ParsedEvent = { ...ownedEvent, date: '2026-08-27' };
      const eventService = TestBed.inject(EventService);
      spyOn(eventService, 'updateEvent').and.returnValue(of(movedEvent));
      const dialogRefStub = {
        afterClosed: () => of({ title: '', date: '2026-08-27', start: '10:00', duration: 30, isPublic: false }),
      };
      spyOn(fixture.componentInstance.dialog, 'open').and.returnValue(dialogRefStub as never);

      fixture.componentInstance.openEventDetails(ownedEvent);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('#event-1')).withContext('event-1 removed after move').toBeNull();
    });

    it('deletes the event and removes it from the current view when confirmed', async () => {
      httpMock.expectOne('http://localhost:8080/api/events?date=2026-08-26').flush(mockEventDtos);
      await fixture.whenStable();
      fixture.detectChanges();
      const authService = TestBed.inject(AuthService);
      (authService as unknown as { currentUser: () => { id: number } }).currentUser = () => ({ id: 2 });
      const eventService = TestBed.inject(EventService);
      const deleteEventSpy = spyOn(eventService, 'deleteEvent').and.returnValue(of(undefined));
      const dialogRefStub = { afterClosed: () => of({ delete: true }) };
      spyOn(fixture.componentInstance.dialog, 'open').and.returnValue(dialogRefStub as never);

      fixture.componentInstance.openEventDetails(ownedEvent);
      fixture.detectChanges();

      expect(deleteEventSpy).toHaveBeenCalledWith(1);
      expect(fixture.nativeElement.querySelector('#event-1')).withContext('event-1 removed after delete').toBeNull();
    });

    it('does not update or delete anything when the dialog is closed without a result', () => {
      httpMock.expectOne('http://localhost:8080/api/events?date=2026-08-26').flush([]);
      const authService = TestBed.inject(AuthService);
      (authService as unknown as { currentUser: () => { id: number } }).currentUser = () => ({ id: 2 });
      const eventService = TestBed.inject(EventService);
      const updateEventSpy = spyOn(eventService, 'updateEvent');
      const deleteEventSpy = spyOn(eventService, 'deleteEvent');
      const dialogRefStub = { afterClosed: () => of(undefined) };
      spyOn(fixture.componentInstance.dialog, 'open').and.returnValue(dialogRefStub as never);

      fixture.componentInstance.openEventDetails(ownedEvent);

      expect(updateEventSpy).not.toHaveBeenCalled();
      expect(deleteEventSpy).not.toHaveBeenCalled();
    });

    it('opens read-only when the current user does not own the event', () => {
      httpMock.expectOne('http://localhost:8080/api/events?date=2026-08-26').flush([]);
      const authService = TestBed.inject(AuthService);
      (authService as unknown as { currentUser: () => { id: number } }).currentUser = () => ({ id: 99 });
      const dialogRefStub = { afterClosed: () => of(undefined) };
      const dialogSpy = spyOn(fixture.componentInstance.dialog, 'open').and.returnValue(dialogRefStub as never);

      fixture.componentInstance.openEventDetails(ownedEvent);

      expect(dialogSpy).toHaveBeenCalledWith(EventDetailsComponent, {
        data: { event: ownedEvent, canEdit: false },
      });
    });
  });
});

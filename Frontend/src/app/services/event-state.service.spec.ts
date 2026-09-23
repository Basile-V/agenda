import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { EventStateService } from './event-state.service';
import { EventService } from './event.service';
import { EventRawDTO, ParsedEvent } from '../models/event.model';

describe('EventStateService', () => {
  let service: EventStateService;
  let eventService: jasmine.SpyObj<EventService>;

  const mockDtos: EventRawDTO[] = [
    { id: 1, date: '2026-08-26', start: '10:00', duration: 30, ownerId: 2, isPublic: false },
  ];
  const parsedEvents: ParsedEvent[] = [{ ...mockDtos[0], startMinutes: 10 * 60, endMinutes: 10 * 60 + 30 }];

  beforeEach(() => {
    eventService = jasmine.createSpyObj<EventService>('EventService', [
      'loadEvents',
      'createEvent',
      'updateEvent',
      'deleteEvent',
    ]);
    eventService.loadEvents.and.returnValue(of(parsedEvents));

    TestBed.configureTestingModule({
      providers: [EventStateService, { provide: EventService, useValue: eventService }],
    });
    service = TestBed.inject(EventStateService);
  });

  async function loadEvents() {
    const events = TestBed.runInInjectionContext(() => service.loadFor(() => '2026-08-26'));
    await TestBed.inject(ApplicationRef).whenStable();
    return events;
  }

  it('loadFor requests events for the given date key', async () => {
    const events = await loadEvents();

    expect(eventService.loadEvents).toHaveBeenCalledWith('2026-08-26');
    expect(events.value()).toEqual(parsedEvents);
  });

  it('createEvent appends the created event to the current list', async () => {
    const events = await loadEvents();
    const created: ParsedEvent = {
      id: 2,
      date: '2026-08-26',
      start: '14:00',
      duration: 30,
      ownerId: 2,
      isPublic: false,
      startMinutes: 14 * 60,
      endMinutes: 14 * 60 + 30,
    };
    eventService.createEvent.and.returnValue(of(created));

    await firstValueFrom(
      service.createEvent({ date: '2026-08-26', start: '14:00', duration: 30, isPublic: false }),
    );

    expect(events.value()).toEqual([...parsedEvents, created]);
  });

  it('updateEvent keeps the event in the list when it stays on the displayed day', async () => {
    const events = await loadEvents();
    const updated: ParsedEvent = { ...parsedEvents[0], title: 'Renommé' };
    eventService.updateEvent.and.returnValue(of(updated));

    await firstValueFrom(
      service.updateEvent(1, { date: '2026-08-26', start: '10:00', duration: 30, isPublic: false }),
    );

    expect(events.value()).toEqual([updated]);
  });

  it('updateEvent removes the event from the list when it moves to another day', async () => {
    const events = await loadEvents();
    const moved: ParsedEvent = { ...parsedEvents[0], date: '2026-08-27' };
    eventService.updateEvent.and.returnValue(of(moved));

    await firstValueFrom(
      service.updateEvent(1, { date: '2026-08-27', start: '10:00', duration: 30, isPublic: false }),
    );

    expect(events.value()).toEqual([]);
  });

  it('deleteEvent removes the deleted event from the list', async () => {
    const events = await loadEvents();
    eventService.deleteEvent.and.returnValue(of(undefined));

    await firstValueFrom(service.deleteEvent(1));

    expect(events.value()).toEqual([]);
  });
});

import { inject, ResourceRef, Service } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, tap } from 'rxjs';
import { EventPayload, ParsedEvent } from '../models/event.model';
import { EventService } from './event.service';

@Service()
export class EventStateService {
  private readonly eventService = inject(EventService);

  private events!: ResourceRef<ParsedEvent[]>;
  private dateKey!: () => string;

  public loadFor(dateKey: () => string): ResourceRef<ParsedEvent[]> {
    this.dateKey = dateKey;
    this.events = rxResource({
      params: dateKey,
      stream: ({ params }) => this.eventService.loadEvents(params),
      defaultValue: [] as ParsedEvent[],
    });
    return this.events;
  }

  public createEvent(payload: EventPayload): Observable<ParsedEvent> {
    return this.eventService
      .createEvent(payload)
      .pipe(tap((created) => this.events.update((list) => [...list, created])));
  }

  public updateEvent(id: number, changes: EventPayload): Observable<ParsedEvent> {
    return this.eventService.updateEvent(id, changes).pipe(
      tap((updated) => {
        const isOnDisplayedDay = updated.date === this.dateKey();
        this.events.update((list) =>
          isOnDisplayedDay
            ? list.map((e) => (e.id === updated.id ? updated : e))
            : list.filter((e) => e.id !== updated.id),
        );
      }),
    );
  }

  public deleteEvent(id: number): Observable<void> {
    return this.eventService
      .deleteEvent(id)
      .pipe(tap(() => this.events.update((list) => list.filter((e) => e.id !== id))));
  }
}

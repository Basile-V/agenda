import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventRaw, ParsedEvent, parseTimeToMinutes } from '../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly url = 'assets/input.json';

  constructor(private http: HttpClient) {}

  loadEvents(): Observable<ParsedEvent[]> {
    return this.http
      .get<EventRaw[]>(this.url)
      .pipe(map((list: EventRaw[]) => list.map((e: EventRaw) => this.parseEvent(e))));
  }

  createEvent(raw: Omit<EventRaw, 'id'>): ParsedEvent {
    return this.parseEvent({ id: Date.now(), ...raw });
  }

  private parseEvent(e: EventRaw): ParsedEvent {
    const startMinutes = parseTimeToMinutes(e.start);
    const endMinutes = startMinutes + e.duration;
    return { ...e, startMinutes, endMinutes };
  }
}

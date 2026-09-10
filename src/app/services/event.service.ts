import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventRaw, ParsedEvent, parseTimeToMinutes } from '../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly url = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  loadEvents(date: string): Observable<ParsedEvent[]> {
    const params = new HttpParams().set('date', date);
    return this.http
      .get<EventRaw[]>(this.url, { params })
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

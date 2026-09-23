import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventPayload, EventRawDTO, ParsedEvent, parseTimeToMinutes } from '../models/event.model';
import { environment } from '../../environments/environment';

@Service()
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/api/events`;

  public loadEvents(date: string): Observable<ParsedEvent[]> {
    const params = new HttpParams().set('date', date);
    return this.http
      .get<EventRawDTO[]>(this.url, { params })
      .pipe(map((eventDtos: EventRawDTO[]) => eventDtos.map((eventDto) => this.parseEvent(eventDto))));
  }

  public createEvent(payload: EventPayload): Observable<ParsedEvent> {
    return this.http
      .post<EventRawDTO>(this.url, payload)
      .pipe(map((createdEventDto: EventRawDTO) => this.parseEvent(createdEventDto)));
  }

  public updateEvent(id: number, payload: EventPayload): Observable<ParsedEvent> {
    return this.http
      .put<EventRawDTO>(`${this.url}/${id}`, payload)
      .pipe(map((updatedEventDto: EventRawDTO) => this.parseEvent(updatedEventDto)));
  }

  public deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  public parseEvent(eventDto: EventRawDTO): ParsedEvent {
    const startMinutes = parseTimeToMinutes(eventDto.start);
    const endMinutes = startMinutes + eventDto.duration;
    return { ...eventDto, startMinutes, endMinutes };
  }
}

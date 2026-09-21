import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { filter, Observable, switchMap, tap } from 'rxjs';

import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { layoutEvents, LayoutEvent } from '../../../utils/layout.utils';
import { EventComponent } from '../../molecules/event/event.component';
import { TimeSlotComponent } from '../../molecules/time-slot/time-slot.component';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  EventPayload,
  ParsedEvent,
  toDateKey,
} from '../../../models/event.model';
import { CreateTaskComponent } from '../create-task/create-task.component';
import { EventDetailsComponent } from '../event-details/event-details.component';
import { ButtonComponent } from '../../atoms/button/button.component';

const EVENTS_LEFT_MARGIN_PX = 20;

@Component({
  selector: 'app-calendar',
  imports: [EventComponent, TimeSlotComponent, ButtonComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
  public readonly dialog = inject(MatDialog);
  public readonly selectedDate = input<Date>(new Date());

  protected readonly hours: readonly number[] = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR },
    (_, i) => DAY_START_HOUR + i,
  );

  private readonly eventService = inject(EventService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private readonly containerSize = signal({ width: 0, height: 0 });
  private readonly events = rxResource({
    params: () => toDateKey(this.selectedDate()),
    stream: ({ params }) => this.eventService.loadEvents(params),
    defaultValue: [] as ParsedEvent[],
  });

  protected readonly height = computed(() => this.containerSize().height);
  protected readonly layouted = computed<LayoutEvent[]>(() => {
    const { width, height } = this.containerSize();
    return layoutEvents(this.events.value(), width - EVENTS_LEFT_MARGIN_PX, height);
  });

  public constructor() {
    afterNextRender(() => {
      const element = this.container().nativeElement;
      const observer = new ResizeObserver(() => this.measureContainer(element));
      observer.observe(element);
      this.destroyRef.onDestroy(() => observer.disconnect());
      this.measureContainer(element);
    });
  }

  public openDialog(): void {
    this.dialog
      .open(CreateTaskComponent, { data: { date: toDateKey(this.selectedDate()) } })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap((result) => this.eventService.createEvent(result)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((created) => this.events.update((list) => [...list, created]));
  }

  public openEventDetails(event: ParsedEvent): void {
    const canEdit = event.ownerId === this.authService.currentUser()?.id;

    this.dialog
      .open(EventDetailsComponent, { data: { event, canEdit } })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap((result) =>
          result.delete ? this.deleteEvent(event.id) : this.updateEvent(event.id, result),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private measureContainer(element: HTMLElement): void {
    this.containerSize.set({ width: element.clientWidth, height: element.clientHeight });
  }

  private deleteEvent(id: number): Observable<void> {
    return this.eventService
      .deleteEvent(id)
      .pipe(tap(() => this.events.update((list) => list.filter((e) => e.id !== id))));
  }

  private updateEvent(id: number, changes: EventPayload): Observable<ParsedEvent> {
    return this.eventService.updateEvent(id, changes).pipe(
      tap((updated) => {
        const isOnDisplayedDay = updated.date === toDateKey(this.selectedDate());
        this.events.update((list) =>
          isOnDisplayedDay
            ? list.map((e) => (e.id === updated.id ? updated : e))
            : list.filter((e) => e.id !== updated.id),
        );
      }),
    );
  }
}

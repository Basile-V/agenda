import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  signal,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';

import { EventService } from '../../../services/event.service';
import { layoutEvents, LayoutEvent } from '../../../utils/layout.utils';
import { EventComponent } from '../../molecules/event/event.component';
import { TimeSlotComponent } from '../../molecules/time-slot/time-slot.component';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  isSameDate,
  ParsedEvent,
  toDateKey,
} from '../../../models/event.model';
import { MatDialog } from '@angular/material/dialog';
import { CreateTaskComponent } from '../create-task/create-task.component';
import { ButtonComponent } from '../../atoms/button/button.component';

@Component({
  selector: 'app-calendar',
  imports: [EventComponent, TimeSlotComponent, ButtonComponent],
  templateUrl: './calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  private readonly eventService = inject(EventService);
  readonly dialog = inject(MatDialog);

  readonly selectedDate = input<Date>(new Date());

  readonly layouted = signal<LayoutEvent[]>([]);
  readonly height = signal(0);
  hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);

  private readonly allEvents = signal<ParsedEvent[]>([]);
  private readonly viewReady = signal(false);
  private readonly visibleEvents = computed(() =>
    this.allEvents().filter((event) => isSameDate(event.date, this.selectedDate())),
  );
  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      const events = this.visibleEvents();
      if (this.viewReady()) {
        this.updateLayout(events);
      }
    });
  }

  ngAfterViewInit(): void {
    this.eventService.loadEvents().subscribe((list) => this.allEvents.set(list));

    // observe container size changes to update ppm/layout reactively
    this.resizeObserver = new ResizeObserver(() => {
      if (this.viewReady()) this.updateLayout(this.visibleEvents());
    });
    this.resizeObserver.observe(this.containerRef.nativeElement);
    this.viewReady.set(true);
  }

  @HostListener('window:resize') onResize() {
    if (this.viewReady()) {
      this.updateLayout(this.visibleEvents());
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  private updateLayout(events: ParsedEvent[]) {
    const el = this.containerRef.nativeElement;
    const width = el.clientWidth - 20;
    const height = el.clientHeight;
    this.height.set(height);
    this.layouted.set(layoutEvents(events, width, height));
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CreateTaskComponent, {
      data: { date: toDateKey(this.selectedDate()) },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newEvent = this.eventService.createEvent(result);
        this.allEvents.update((events) => [...events, newEvent]);
      }
    });
  }
}

import { AfterViewInit, Component, ElementRef, HostListener, inject, OnDestroy, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import { EventService } from '../../../services/event.service';
import { layoutEvents, LayoutEvent } from '../../../utils/layout.utils';
import { EventComponent } from '../../molecules/event/event.component';
import { TimeSlotComponent } from '../../molecules/time-slot/time-slot.component';
import { DAY_END_HOUR, DAY_START_HOUR, ParsedEvent } from '../../../models/event.model';
import { MatIcon } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { CreateTaskComponent } from '../create-task/create-task.component';

@Component({
    selector: 'app-calendar',
    imports: [EventComponent, TimeSlotComponent, MatIcon],
    templateUrl: './calendar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  private readonly eventService = inject(EventService);
  readonly dialog = inject(MatDialog);

  readonly layouted = signal<LayoutEvent[]>([]);
  readonly height = signal(0);
  hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);

  private eventsLoaded = false;
  private lastEvents: ParsedEvent[] = [];
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.eventService.loadEvents().subscribe(list => {
      this.eventsLoaded = true;
      this.lastEvents = list;
      this.updateLayout(list);
    });

    // observe container size changes to update ppm/layout reactively
    this.resizeObserver = new ResizeObserver(() => {
      if (this.eventsLoaded && this.lastEvents.length) this.updateLayout(this.lastEvents);
    });
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }

  @HostListener('window:resize') onResize() {
    if (this.eventsLoaded && this.lastEvents.length) {
      this.updateLayout(this.lastEvents);
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
    const dialogRef = this.dialog.open(CreateTaskComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newEvent = this.eventService.createEvent(result);
        this.lastEvents = [...this.lastEvents, newEvent];
        this.updateLayout(this.lastEvents);
      }
    });
  }
}

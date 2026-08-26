import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { layoutEvents, LayoutEvent } from '../../utils/layout.utils';
import { EventComponent } from '../event/event.component';
import { TimeSlotComponent } from '../time-slot/time-slot.component';
import { DAY_END_HOUR, DAY_START_HOUR } from '../../models/event.model';
import { MatIcon } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { CreateTaskComponent } from '../create-task/create-task.component';

@Component({
    selector: 'app-calendar',
    imports: [CommonModule, EventComponent, TimeSlotComponent, MatIcon],
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements AfterViewInit {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  readonly dialog = inject(MatDialog);

  layouted: LayoutEvent[] = [];

  private eventsLoaded = false;
  private lastEvents: any[] = [];
  private resizeObserver?: ResizeObserver;
  hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);
  height = 0;

  constructor(private eventService: EventService, private cdr: ChangeDetectorRef) {}

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
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }

  private updateLayout(events: any[]) {
    const el = this.containerRef.nativeElement;
    const width = el.clientWidth - 20;
    const height = el.clientHeight;
    this.height = height;
    this.layouted = layoutEvents(events, width, height);
    this.cdr.detectChanges();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CreateTaskComponent, {
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newEvent = this.eventService.createEvent(result);
        this.lastEvents = [...this.lastEvents, newEvent];
        this.updateLayout(this.lastEvents);
      }
    });
  }
}


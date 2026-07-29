import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { layoutEvents, LayoutEvent } from '../../utils/layout.utils';
import { EventComponent } from '../event/event.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, EventComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements AfterViewInit {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  layouted: LayoutEvent[] = [];

  private eventsLoaded = false;
  private lastEvents: any[] = [];
  private resizeObserver?: ResizeObserver;

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
    const width = el.clientWidth;
    const height = el.clientHeight;
    this.layouted = layoutEvents(events, width, height);
    this.cdr.detectChanges();
  }
}

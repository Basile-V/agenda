import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CalendarComponent } from './component/calendar/calendar.component';
import { CalendarHeaderComponent } from "./component/calendar-header/calendar-header.component";

@Component({
    selector: 'app-root',
    imports: [CalendarComponent, CalendarHeaderComponent],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'rendering-events';
}

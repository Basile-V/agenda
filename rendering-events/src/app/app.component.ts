import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CalendarComponent } from './component/organisms/calendar/calendar.component';
import { CalendarHeaderComponent } from './component/molecules/calendar-header/calendar-header.component';

@Component({
  selector: 'app-root',
  imports: [CalendarComponent, CalendarHeaderComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'rendering-events';
  readonly selectedDate = signal(new Date());
}

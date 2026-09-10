import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CalendarComponent } from '../../organisms/calendar/calendar.component';
import { CalendarHeaderComponent } from '../../molecules/calendar-header/calendar-header.component';


@Component({
  selector: 'app-home',
  imports: [CalendarComponent, CalendarHeaderComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './home.component.scss',
})
export class HomeComponent {

  readonly selectedDate = signal(new Date());
}

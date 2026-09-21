import { Component, signal } from '@angular/core';
import { CalendarComponent } from '../../organisms/calendar/calendar.component';
import { CalendarHeaderComponent } from '../../molecules/calendar-header/calendar-header.component';

@Component({
  selector: 'app-home',
  imports: [CalendarComponent, CalendarHeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly selectedDate = signal(new Date());
}

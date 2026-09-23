import { Component, computed, input } from '@angular/core';
import { CalendarComponent } from '../../organisms/calendar/calendar.component';
import { CalendarHeaderComponent } from '../../molecules/calendar-header/calendar-header.component';
import { fromDateKey } from '../../../models/event.model';

@Component({
  selector: 'app-home',
  imports: [CalendarComponent, CalendarHeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  public readonly date = input.required<string>();

  protected readonly selectedDate = computed(() => fromDateKey(this.date()));
}

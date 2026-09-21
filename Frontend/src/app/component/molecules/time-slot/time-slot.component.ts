import { Component, input } from '@angular/core';

@Component({
  selector: 'app-time-slot',
  imports: [],
  templateUrl: './time-slot.component.html',
  styleUrls: ['./time-slot.component.scss'],
})
export class TimeSlotComponent {
  public readonly hour = input.required<number>();
  public readonly height = input.required<number>();
}

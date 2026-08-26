import { Component, input, ChangeDetectionStrategy } from '@angular/core';

import { DAY_START_HOUR } from '../../../models/event.model';

@Component({
    selector: 'app-time-slot',
    imports: [],
    templateUrl: './time-slot.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./time-slot.component.scss']
})
export class TimeSlotComponent {
  hour = input.required<number>();
  height = input.required<number>();
}

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { DAY_START_HOUR } from '../../../models/event.model';

@Component({
    selector: 'app-time-slot',
    imports: [],
    templateUrl: './time-slot.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./time-slot.component.scss']
})
export class TimeSlotComponent {
  @Input({ required: true }) hour!: number;
  @Input({ required: true }) height!: number;
  
}

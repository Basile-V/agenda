import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DAY_START_HOUR } from '../../models/event.model';

@Component({
    selector: 'app-time-slot',
    imports: [CommonModule],
    templateUrl: './time-slot.component.html',
    styleUrls: ['./time-slot.component.scss']
})
export class TimeSlotComponent {
  @Input({ required: true }) hour!: number;
  @Input({ required: true }) height!: number;
  
}

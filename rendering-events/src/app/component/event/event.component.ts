import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutEvent } from '../../utils/layout.utils';

@Component({
    selector: 'app-event',
    imports: [CommonModule],
    templateUrl: './event.component.html',
    styleUrls: ['./event.component.scss']
})
export class EventComponent {
  @Input({ required: true }) event!: LayoutEvent | null;
}

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { LayoutEvent } from '../../../utils/layout.utils';

@Component({
    selector: 'app-event',
    imports: [],
    templateUrl: './event.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./event.component.scss']
})
export class EventComponent {
  @Input({ required: true }) event!: LayoutEvent | null;
}

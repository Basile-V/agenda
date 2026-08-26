import { Component, Input } from '@angular/core';

import { LayoutEvent } from '../../utils/layout.utils';

@Component({
    selector: 'app-event',
    imports: [],
    templateUrl: './event.component.html',
    styleUrls: ['./event.component.scss']
})
export class EventComponent {
  @Input({ required: true }) event!: LayoutEvent | null;
}

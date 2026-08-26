import { Component, input, ChangeDetectionStrategy } from '@angular/core';

import { LayoutEvent } from '../../../utils/layout.utils';

@Component({
    selector: 'app-event',
    imports: [],
    templateUrl: './event.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./event.component.scss']
})
export class EventComponent {
  event = input.required<LayoutEvent | null>();
}

import { Component, input, output } from '@angular/core';

import { LayoutEvent } from '../../../utils/layout.utils';

@Component({
  selector: 'app-event',
  imports: [],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
})
export class EventComponent {
  public readonly event = input.required<LayoutEvent>();
  public readonly eventSelected = output<LayoutEvent>();

  public onSelect(): void {
    const event = this.event();
    if (event) {
      this.eventSelected.emit(event);
    }
  }
}

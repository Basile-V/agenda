import { Component, Input, WritableSignal } from "@angular/core";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-button',
    imports: [CommonModule],
    templateUrl: './button.component.html'
})
export class ButtonComponent{
    @Input() message = '';
    @Input() action: (() => void) | undefined;
}
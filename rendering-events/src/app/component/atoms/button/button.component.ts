import { Component, Input, WritableSignal, ChangeDetectionStrategy } from "@angular/core";


@Component({
    selector: 'app-button',
    imports: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './button.component.html'
})
export class ButtonComponent{
    @Input() message = '';
    @Input() action: (() => void) | undefined;
}
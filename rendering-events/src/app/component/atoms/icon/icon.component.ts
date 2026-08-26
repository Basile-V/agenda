import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIconModule]
})
export class IconComponent{
    @Input() icon = '';
    @Input() action: (() => void) | undefined;

}
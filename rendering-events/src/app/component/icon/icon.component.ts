import { Component, Input } from "@angular/core";
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-icon',
    standalone: true,
    templateUrl: './icon.component.html',
    imports: [MatIconModule]
})
export class IconComponent{
    @Input() icon = '';
    @Input() action: (() => void) | undefined;

}
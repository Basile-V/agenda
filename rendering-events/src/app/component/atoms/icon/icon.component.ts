import { Component, input, ChangeDetectionStrategy } from "@angular/core";
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule]
})
export class IconComponent{
    icon = input('');
    action = input<(() => void) | undefined>(undefined);
}

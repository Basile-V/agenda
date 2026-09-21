import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  imports: [MatIconModule],
})
export class IconComponent {
  public readonly icon = input('');
  public readonly action = input<(() => void) | undefined>(undefined);
}

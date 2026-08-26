import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-button',
  imports: [MatFabButton, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  message = input('');
  icon = input('');
  ariaLabel = input('');
  fab = input(false);
  action = input<(() => void) | undefined>(undefined);
}

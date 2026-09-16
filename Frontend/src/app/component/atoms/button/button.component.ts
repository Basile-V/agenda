import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-button',
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  message = input('');
  icon = input('');
  ariaLabel = input('');
  fab = input(false);
  filled = input(false);
  color = input<'primary' | 'accent' | 'warn' | ''>('');
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  action = input<(() => void) | undefined>(undefined);
}

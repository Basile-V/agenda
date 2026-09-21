import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-button',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  public readonly message = input('');
  public readonly icon = input('');
  public readonly ariaLabel = input('');
  public readonly fab = input(false);
  public readonly filled = input(false);
  public readonly color = input<'primary' | 'accent' | 'warn' | ''>('');
  public readonly type = input<'button' | 'submit'>('button');
  public readonly disabled = input(false);
  public readonly action = input<(() => void) | undefined>(undefined);
}

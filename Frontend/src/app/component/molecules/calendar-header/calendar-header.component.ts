import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { toDateKey } from '../../../models/event.model';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-calendar-header',
  imports: [CommonModule, ButtonComponent, IconComponent],
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss'],
})
export class CalendarHeaderComponent {
  public readonly dateSelected = input.required<Date>();

  protected readonly todayButton = "Aujourd'hui";
  protected readonly iconLeft = 'keyboard_arrow_left';
  protected readonly iconRight = 'keyboard_arrow_right';
  protected readonly iconLogout = 'logout';

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly setToday = (): void => {
    this.navigateTo(new Date());
  };

  protected readonly setNextDay = (): void => {
    const nextDate = new Date(this.dateSelected());
    nextDate.setDate(nextDate.getDate() + 1);
    this.navigateTo(nextDate);
  };

  protected readonly setPreviousDay = (): void => {
    const previousDate = new Date(this.dateSelected());
    previousDate.setDate(previousDate.getDate() - 1);
    this.navigateTo(previousDate);
  };

  protected readonly logout = (): void => {
    this.authService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.router.navigateByUrl('/login'));
  };

  private navigateTo(date: Date): void {
    this.router.navigateByUrl(`/${toDateKey(date)}`);
  }
}

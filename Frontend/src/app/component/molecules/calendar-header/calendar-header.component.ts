import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-calendar-header',
  imports: [CommonModule, ButtonComponent, IconComponent],
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss'],
})
export class CalendarHeaderComponent {
  public readonly dateSelected = model<Date>(new Date());

  protected readonly todayButton = "Aujourd'hui";
  protected readonly iconLeft = 'keyboard_arrow_left';
  protected readonly iconRight = 'keyboard_arrow_right';
  protected readonly iconLogout = 'logout';

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly setToday = (): void => {
    this.dateSelected.set(new Date());
  };

  protected readonly setNextDay = (): void => {
    const currentDate = this.dateSelected();
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    this.dateSelected.set(nextDate);
  };

  protected readonly setPreviousDay = (): void => {
    const currentDate = this.dateSelected();
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    this.dateSelected.set(previousDate);
  };

  protected readonly logout = (): void => {
    this.authService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.router.navigateByUrl('/login'));
  };
}

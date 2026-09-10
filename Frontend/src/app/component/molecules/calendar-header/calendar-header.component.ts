import { CommonModule } from '@angular/common';
import { Component, model, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar-header',
  imports: [CommonModule, ButtonComponent, IconComponent],
  templateUrl: './calendar-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./calendar-header.component.scss'],
})
export class CalendarHeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly currentUser = this.authService.currentUser;

  dateSelected = model<Date>(new Date());
  todayButton = "Aujourd'hui";
  iconLeft = 'keyboard_arrow_left';
  iconRight = 'keyboard_arrow_right';
  iconLogout = 'logout';



  setToday = () => {
    this.dateSelected.set(new Date());
  };

  setNextDay = () => {
    const currentDate = this.dateSelected();
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    this.dateSelected.set(nextDate);
  };

  setPreviousDay = () => {
    const currentDate = this.dateSelected();
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    this.dateSelected.set(previousDate);
  };

  logout = () => {
    this.authService.logout().subscribe(() => this.router.navigateByUrl('/login'));
  };
}

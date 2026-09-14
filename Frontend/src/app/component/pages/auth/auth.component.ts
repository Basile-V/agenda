import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { LoginComponent } from '../../organisms/login/login.component';
import { RegisterComponent } from '../../organisms/register/register.component';

@Component({
  selector: 'app-auth',
  imports: [MatTabsModule, LoginComponent, RegisterComponent],
  templateUrl: './auth.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './auth.component.scss',
})
export class AuthComponent {}

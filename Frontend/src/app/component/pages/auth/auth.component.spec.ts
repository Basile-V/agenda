import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from '../../organisms/login/login.component';
import { AuthService } from '../../../services/auth.service';

describe('AuthComponent', () => {
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'register']);

    TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }],
    });

    fixture = TestBed.createComponent(AuthComponent);
    fixture.detectChanges();
  });

  it('renders a login tab and a register tab', () => {
    const tabLabels: string[] = Array.from(
      fixture.nativeElement.querySelectorAll('.mdc-tab__text-label'),
    ).map((element) => (element as HTMLElement).textContent?.trim());

    expect(tabLabels).toEqual(['Connexion', 'Créer un compte']);
  });

  it('shows the login form in the active tab by default', () => {
    expect(fixture.debugElement.query(By.directive(LoginComponent))).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/auth.model';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const user: User = { id: 1, username: 'alice', displayName: 'Alice', role: 'USER' };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
  });

  it('marks all fields as touched and does not call login when the form is invalid', () => {
    component.onSubmit();

    expect(component.loginForm.controls.username.touched).toBeTrue();
    expect(component.loginForm.controls.password.touched).toBeTrue();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('calls AuthService.login with the form values and navigates on success', () => {
    authServiceSpy.login.and.returnValue(of(user));
    component.loginForm.setValue({ username: 'alice', password: 'secret' });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ username: 'alice', password: 'secret' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows an error message when login fails', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('invalid')));
    component.loginForm.setValue({ username: 'alice', password: 'wrong' });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Identifiants invalides');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});

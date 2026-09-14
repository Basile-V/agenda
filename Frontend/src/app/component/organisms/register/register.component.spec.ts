import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/auth.model';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const user: User = { id: 1, username: 'alice', displayName: 'Alice', role: 'USER' };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['register']);

    TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }],
    });

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
  });

  it('marks all fields as touched and does not call register when the form is invalid', () => {
    component.onSubmit();

    expect(component.registerForm.controls.username.touched).toBeTrue();
    expect(component.registerForm.controls.displayName.touched).toBeTrue();
    expect(component.registerForm.controls.password.touched).toBeTrue();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('does not call register when the password is shorter than 8 characters', () => {
    component.registerForm.setValue({ username: 'alice', displayName: 'Alice', password: 'short' });

    component.onSubmit();

    expect(component.registerForm.controls.password.hasError('minlength')).toBeTrue();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('calls AuthService.register with the form values and navigates on success', () => {
    authServiceSpy.register.and.returnValue(of(user));
    component.registerForm.setValue({ username: 'alice', displayName: 'Alice', password: 'secretpwd' });

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      username: 'alice',
      displayName: 'Alice',
      password: 'secretpwd',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows an error message when registration fails', () => {
    authServiceSpy.register.and.returnValue(throwError(() => new Error('conflict')));
    component.registerForm.setValue({ username: 'alice', displayName: 'Alice', password: 'secretpwd' });

    component.onSubmit();

    expect(component.errorMessage()).toBe("Ce nom d'utilisateur est déjà utilisé");
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});

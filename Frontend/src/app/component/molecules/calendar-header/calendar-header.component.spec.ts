import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { CalendarHeaderComponent } from './calendar-header.component';
import { AuthService } from '../../../services/auth.service';

describe('CalendarHeaderComponent', () => {
  let fixture: ComponentFixture<CalendarHeaderComponent>;
  let router: Router;

  beforeEach(() => {
    const authServiceStub = {
      currentUser: () => null,
      logout: () => of(undefined),
    };

    TestBed.configureTestingModule({
      imports: [CalendarHeaderComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceStub as unknown as AuthService },
      ],
    });

    fixture = TestBed.createComponent(CalendarHeaderComponent);
    fixture.componentRef.setInput('dateSelected', new Date(2026, 7, 26));
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    fixture.detectChanges();
  });

  it('renders the selected date', () => {
    const compiled = fixture.debugElement.nativeElement as HTMLElement;

    expect(compiled.querySelector('#dayNumber')?.textContent?.trim()).toBe('26');
  });

  it('navigates to the previous and next day on click', () => {
    const [previous, next] = (fixture.debugElement.nativeElement as HTMLElement).querySelectorAll(
      '#navigate mat-icon',
    );

    next.dispatchEvent(new MouseEvent('click'));
    expect(router.navigateByUrl).toHaveBeenCalledWith('/2026-08-27');

    previous.dispatchEvent(new MouseEvent('click'));
    expect(router.navigateByUrl).toHaveBeenCalledWith('/2026-08-25');
  });

  it('navigates to today on click', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 8, 1));

    (fixture.debugElement.nativeElement as HTMLElement)
      .querySelector('#navigate button')
      ?.dispatchEvent(new MouseEvent('click'));

    expect(router.navigateByUrl).toHaveBeenCalledWith('/2026-09-01');
    jasmine.clock().uninstall();
  });
});

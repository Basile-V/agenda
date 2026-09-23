import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { HomeComponent } from './home.component';
import { AuthService } from '../../../services/auth.service';

describe('HomeComponent (integration)', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    const authServiceStub = {
      currentUser: () => null,
      logout: () => of(undefined),
    };

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceStub as unknown as AuthService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HomeComponent);
    fixture.componentRef.setInput('date', '2026-08-26');
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('drives the header and the calendar from the date route input', () => {
    httpMock.expectOne('http://localhost:8080/api/events?date=2026-08-26').flush([]);

    const compiled = fixture.debugElement.nativeElement as HTMLElement;
    expect(compiled.querySelector('#dayNumber')?.textContent?.trim()).toBe('26');
  });
});

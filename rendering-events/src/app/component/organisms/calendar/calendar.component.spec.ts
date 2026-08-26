import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CalendarComponent } from './calendar.component';
import { EventComponent } from '../../molecules/event/event.component';

import * as inputJson from '../../../../assets/input.json';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('CalendarComponent (integration)', () => {
  let fixture: ComponentFixture<CalendarComponent>;
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CalendarComponent, EventComponent],
      providers: [
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CalendarComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('renders events from assets/input.json with expected ids', () => {
    const req = httpMock.expectOne('assets/input.json');
    req.flush((inputJson as any).default || inputJson);

    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement as HTMLElement;
    const inputs: any[] = (inputJson as any).default || inputJson;
    for (const e of inputs) {
      const el = compiled.querySelector(`#event-${e.id}`);
      expect(el).withContext(`event-${e.id} exists`).not.toBeNull();
    }
  });
});

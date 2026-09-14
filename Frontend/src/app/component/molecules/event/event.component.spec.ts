import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventComponent } from './event.component';
import { LayoutEvent } from '../../../utils/layout.utils';

describe('EventComponent', () => {
  let fixture: ComponentFixture<EventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventComponent);
  });

  it('renders event with correct id, aria and styles', () => {
    const mock: LayoutEvent = {
      id: 42,
      date: '2026-08-26',
      start: '10:00',
      duration: 30,
      startMinutes: 10 * 60,
      endMinutes: 10 * 60 + 30,
      ownerId: 2,
      isPublic: false,
      top: 100,
      left: 50,
      width: 200,
      height: 30,
      column: 0,
      totalColumns: 1,
    };

    fixture.componentRef.setInput('event', mock);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('.event');
    expect(el).not.toBeNull();
    expect(el.id).toBe('event-42');
    expect(el.getAttribute('role')).toBe('button');
    const aria = el.getAttribute('aria-label') || '';
    expect(aria).toContain('Event 42');
    // style values should be set (as px strings)
    expect(el.style.top).toBe('100px');
    expect(el.style.left).toBe('50px');
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('30px');
    expect(fixture.nativeElement.querySelector('.event-public-badge')).toBeNull();
  });

  it('shows a public badge when the event is public', () => {
    const mock: LayoutEvent = {
      id: 43,
      date: '2026-08-26',
      start: '10:00',
      duration: 30,
      startMinutes: 10 * 60,
      endMinutes: 10 * 60 + 30,
      ownerId: 2,
      isPublic: true,
      top: 100,
      left: 50,
      width: 200,
      height: 30,
      column: 0,
      totalColumns: 1,
    };

    fixture.componentRef.setInput('event', mock);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.event-public-badge')).not.toBeNull();
  });
});

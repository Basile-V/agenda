import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventComponent } from './event.component';

describe('EventComponent', () => {
  let fixture: ComponentFixture<EventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventComponent);
  });

  it('renders event with correct id, aria and styles', () => {
    const mock = {
      id: 42,
      start: '10:00',
      duration: 30,
      startMinutes: 10 * 60,
      endMinutes: 10 * 60 + 30,
      top: 100,
      left: 50,
      width: 200,
      height: 30,
      column: 0,
      totalColumns: 1
    } as any;

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
  });
});

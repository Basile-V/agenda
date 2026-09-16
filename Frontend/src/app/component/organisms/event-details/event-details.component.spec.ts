import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventDetailsComponent, EventDetailsDialogData } from './event-details.component';
import { ParsedEvent } from '../../../models/event.model';

describe('EventDetailsComponent', () => {
  let fixture: ComponentFixture<EventDetailsComponent>;
  let component: EventDetailsComponent;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EventDetailsComponent>>;

  const event: ParsedEvent = {
    id: 1,
    title: 'Point équipe',
    date: '2026-09-02',
    start: '15:00',
    duration: 90,
    ownerId: 2,
    isPublic: false,
    startMinutes: 15 * 60,
    endMinutes: 15 * 60 + 90,
  };

  function setup(data: EventDetailsDialogData): void {
    dialogRefSpy = jasmine.createSpyObj<MatDialogRef<EventDetailsComponent>>('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [EventDetailsComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });

    fixture = TestBed.createComponent(EventDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('starts in read-only mode pre-filled with the event data', () => {
    setup({ event, canEdit: true });

    expect(component.editing()).toBeFalse();
    expect(component.formEdit.getRawValue()).toEqual({
      title: 'Point équipe',
      date: '2026-09-02',
      start: '15:00',
      duration: 90,
      isPublic: false,
    });
  });

  it('hides the edit action when the user cannot edit the event', () => {
    setup({ event, canEdit: false });

    const editIcon = fixture.nativeElement.querySelector('.edit-icon');
    expect(editIcon).toBeNull();
  });

  it('shows the edit action when the user can edit the event', () => {
    setup({ event, canEdit: true });

    const editIcon = fixture.nativeElement.querySelector('.edit-icon');
    expect(editIcon).not.toBeNull();
  });

  it('hides the delete action when the user cannot edit the event', () => {
    setup({ event, canEdit: false });

    const deleteIcon = fixture.nativeElement.querySelector('.delete-icon');
    expect(deleteIcon).toBeNull();
  });

  it('shows the delete action when the user can edit the event', () => {
    setup({ event, canEdit: true });

    const deleteIcon = fixture.nativeElement.querySelector('.delete-icon');
    expect(deleteIcon).not.toBeNull();
  });

  it('closes with a delete flag when clicking Supprimer', () => {
    setup({ event, canEdit: true });

    component.deleteEvent();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({ delete: true });
  });

  it('switches to edit mode when clicking Modifier', () => {
    setup({ event, canEdit: true });

    component.startEditing();

    expect(component.editing()).toBeTrue();
  });

  it('closes with the form value when submitting valid changes', () => {
    setup({ event, canEdit: true });
    component.startEditing();
    component.formEdit.setValue({
      title: 'Point équipe renommé',
      date: '2026-09-03',
      start: '16:00',
      duration: 45,
      isPublic: true,
    });

    component.onSubmit();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      title: 'Point équipe renommé',
      date: '2026-09-03',
      start: '16:00',
      duration: 45,
      isPublic: true,
    });
  });

  it('marks all fields as touched and does not close when submitting an invalid form', () => {
    setup({ event, canEdit: true });
    component.startEditing();
    component.formEdit.controls.title.setValue('');

    component.onSubmit();

    expect(component.formEdit.controls.title.touched).toBeTrue();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });
});

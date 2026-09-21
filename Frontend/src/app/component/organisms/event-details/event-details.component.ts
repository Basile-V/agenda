import { Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ParsedEvent } from '../../../models/event.model';
import { IconComponent } from '../../atoms/icon/icon.component';
import { ButtonComponent } from '../../atoms/button/button.component';

export interface EventDetailsDialogData {
  event: ParsedEvent;
  canEdit: boolean;
}

@Component({
  selector: 'app-event-details',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    IconComponent,
    ButtonComponent,
  ],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
})
export class EventDetailsComponent {
  protected readonly data = inject<EventDetailsDialogData>(MAT_DIALOG_DATA);
  protected readonly iconEdit = 'edit';
  protected readonly iconDelete = 'delete';

  public readonly editing = signal(false);

  private readonly dialogRef = inject(MatDialogRef<EventDetailsComponent>);
  private readonly fb = inject(FormBuilder);

  public readonly formEdit = this.fb.group({
    title: [this.data.event.title ?? '', Validators.required],
    date: [this.data.event.date, Validators.required],
    start: [this.data.event.start, [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
    duration: [this.data.event.duration, [Validators.required, Validators.min(1)]],
    isPublic: [this.data.event.isPublic],
  });

  public readonly startEditing = (): void => {
    this.editing.set(true);
  };

  protected readonly cancelEditing = (): void => {
    this.editing.set(false);
  };

  protected readonly onClose = (): void => {
    this.dialogRef.close();
  };

  public readonly deleteEvent = (): void => {
    this.dialogRef.close({ delete: true });
  };

  public onSubmit(): void {
    if (this.formEdit.invalid) {
      this.formEdit.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.formEdit.getRawValue());
  }
}

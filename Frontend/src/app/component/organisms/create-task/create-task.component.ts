import { Component, inject } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { toDateKey } from '../../../models/event.model';

export interface CreateTaskDialogData {
  date: string; // 'YYYY-MM-DD'
}

@Component({
  selector: 'app-create-task',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss'],
})
export class CreateTaskComponent {
  private readonly dialogRef = inject(MatDialogRef<CreateTaskComponent>);
  private readonly data = inject<CreateTaskDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    date: [this.data?.date ?? toDateKey(new Date()), Validators.required],
    start: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
    duration: [30, [Validators.required, Validators.min(1)]],
    isPublic: [false],
  });

  protected onNoClick(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }
}

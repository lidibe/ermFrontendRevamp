import { NgIf, NgFor } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DialogContainerComponent } from 'app/layout/common/dialog-container/dialog-container.component';
import { Director } from '../../directors/directors.types';

@Component({
  selector: 'app-meeting-member-add-dialog',
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss'],
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    DialogContainerComponent
  ],
  standalone: true
})
export class AddMeetingsMemberDialogComponent implements OnInit {

  form: FormGroup;
  directors: Director[];
  roles: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { form: FormGroup, directors: Director[], roles: any[] },
    public dialogRef: MatDialogRef<AddMeetingsMemberDialogComponent>,
  ) {
    this.form = data.form;
    this.directors = data.directors;
    this.roles = data.roles;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.dialogRef.close(this.form.getRawValue());
  }

}

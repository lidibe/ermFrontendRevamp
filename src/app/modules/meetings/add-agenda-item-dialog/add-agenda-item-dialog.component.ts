import { NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DialogContainerComponent } from 'app/layout/common/dialog-container/dialog-container.component';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-agenda-item-add-dialog',
  templateUrl: './add-agenda-item-dialog.component.html',
  styleUrls: ['./add-agenda-item-dialog.component.scss'],
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    DialogContainerComponent,
    QuillModule,
  ],
  standalone: true
})
export class AddMeetingsAgendaItemDialogComponent implements OnInit {

  form: FormGroup;
  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{align: []}, {list: 'ordered'}, {list: 'bullet'}],
      ['clean']
    ]
  };

  constructor(
    public dialogRef: MatDialogRef<AddMeetingsAgendaItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FormGroup
  ) {
    this.form = this.data;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    const result = { ...this.form.getRawValue() };
    delete result.code;
    delete result.decision;
    this.dialogRef.close(result);
  }

}

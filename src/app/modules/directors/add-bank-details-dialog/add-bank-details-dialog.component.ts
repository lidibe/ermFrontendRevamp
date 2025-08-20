import { Component, Inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DialogContainerComponent } from 'app/layout/common/dialog-container/dialog-container.component';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-bank-details-add-dialog',
  templateUrl: './add-bank-details-dialog.component.html',
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    DialogContainerComponent,
    QuillModule,
  ],
  standalone: true
})
export class AddBankDetailsDialogComponent {

  form: FormGroup;
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{align: []}, {list: 'ordered'}, {list: 'bullet'}],
      ['clean']
    ]
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { form: FormGroup },
    public dialogRef: MatDialogRef<AddBankDetailsDialogComponent>,
  ) {
    this.form = data.form;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    const result = { ...this.form.getRawValue() };
    delete result['code'];
    this.dialogRef.close(result);
  }
}

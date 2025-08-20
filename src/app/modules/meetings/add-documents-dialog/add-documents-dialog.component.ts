import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DialogContainerComponent } from 'app/layout/common/dialog-container/dialog-container.component';

@Component({
  selector: 'app-docuements-add-dialog',
  templateUrl: './add-documents-dialog.component.html',
  styleUrls: ['./add-documents-dialog.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    DialogContainerComponent
  ],
  standalone: true
})
export class AddMeetingDocumentsDialogComponent implements OnInit {

  selectedFiles: FileList;

  constructor(
    public dialogRef: MatDialogRef<AddMeetingDocumentsDialogComponent>,
  ) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.dialogRef.close(this.selectedFiles);
  }

  selectFiles(event: Event) {
    const isEventDefined = event && event.target;
    const fileInput = event.target as HTMLInputElement;
    const isFileSelected = fileInput.files && fileInput.files.length;
    if (isEventDefined && isFileSelected) this.selectedFiles = fileInput.files;
  }

  getFileInputDisplayValue(): string {
    if (!this.selectedFiles) return '';
    return this.selectedFiles.length === 1
      ? this.selectedFiles[0].name
      : `${this.selectedFiles.length} files selected`
  }
}

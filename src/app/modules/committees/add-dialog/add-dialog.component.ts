import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Director } from 'app/modules/directors/directors.types';

@Component({
  selector: 'app-add-dialog',
  templateUrl: './add-dialog.component.html',
  styleUrls: ['./add-dialog.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class AddDialogComponent implements OnInit {

  members: Director[];
  roles: any[];

  constructor(
    public dialogRef: MatDialogRef<AddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.members = data.members;
    this.roles = data.roles;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit(formValues) {
    this.dialogRef.close(formValues);
  }

}

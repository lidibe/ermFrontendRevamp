import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {Country} from "../directors.types";
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DialogContainerComponent } from 'app/layout/common/dialog-container/dialog-container.component';

@Component({
  selector: 'app-assistant-address-add-dialog',
  templateUrl: './add-assistant-address-dialog.component.html',
  styleUrls: ['./add-assistant-address-dialog.component.scss'],
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    DialogContainerComponent
  ],
  standalone: true
})
export class AddDirectorsAssistantDialogComponent implements OnInit {

  form: FormGroup;
  countries: Country[];

  constructor(
    public dialogRef: MatDialogRef<AddDirectorsAssistantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.data.form;
    this.countries = this.data.countries;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.dialogRef.close(this.form.getRawValue());
  }

  getCountryByCode(code: string): Country {
    if (!code) {
        return this.countries.find((country) => country.iso === 'eg');
    } else {
        return this.countries.find((country) => country.code === code);
    }
}

}

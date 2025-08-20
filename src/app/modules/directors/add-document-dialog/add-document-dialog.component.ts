import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {Country} from "../directors.types";
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DialogContainerComponent } from 'app/layout/common/dialog-container/dialog-container.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

@Component({
  selector: 'app-document-add-dialog',
  templateUrl: './add-document-dialog.component.html',
  styleUrls: ['./add-document-dialog.component.scss'],
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatMomentDateModule,
    DialogContainerComponent
  ],
  standalone: true
})
export class AddDirectorsDocumentDialogComponent implements OnInit {

  form: FormGroup;
  directorCode: string;
  countries: Country[];

  documentTypes = [
    {label: 'Passport', value: 'passport'},
    {label: 'Diplomatic ID', value: 'did'}
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { form: FormGroup, countries: Country[] },
    public dialogRef: MatDialogRef<AddDirectorsDocumentDialogComponent>,
  ) {
    this.form = data.form;
    this.countries = data.countries;
  }

  ngOnInit() {
  }

  getCountryByIso(iso: string): Country {
    if (!iso) {
      return this.countries.find((country) => country.iso === 'eg');
    } else {
      return this.countries.find((country) => country.iso.toLowerCase() === iso.toLowerCase());
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    const result = { ...this.form.getRawValue() };
    delete result['code'];
    delete result['documents'];
    this.dialogRef.close(result);
  }
}

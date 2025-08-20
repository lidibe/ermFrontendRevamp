import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {Country} from "../directors.types";
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DialogContainerComponent } from 'app/layout/common/dialog-container/dialog-container.component';
import { City } from 'app/shared/models/city.types';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-directors-address-add-dialog',
  templateUrl: './add-directors-address-dialog.component.html',
  styleUrls: ['./add-directors-address-dialog.component.scss'],
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    DialogContainerComponent,
    MatAutocompleteModule
  ],
  standalone: true
})
export class AddDirectorsAddressDialogComponent implements OnInit {

  form: FormGroup;
  countries: Country[];
  citites: City[];
  filteredCitites: City[];
  filteredCititesCopy: City[];
  constructor(
    public dialogRef: MatDialogRef<AddDirectorsAddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.data.form;
    this.countries = this.data.countries;
    this.citites = this.data.cities;
  }

  ngOnInit(): void {
    // Filter cities by selected country
    this.form.get('country').valueChanges.subscribe((country: string) => {
      this.filteredCitites = this.citites.filter(_ => _.country === country.toUpperCase());
      this.filteredCititesCopy = [];
    })
    // Filter city aucomplete suggestions based on input value
    this.form.get('city').valueChanges.subscribe((city: string) => {
      this.filteredCitites = this.filteredCitites.map((c) => {return {...c, name: this.normalizeString(c.name)}})
      this.filteredCititesCopy = [...this.filteredCitites];
      this.filteredCititesCopy = this.filteredCitites.filter(c => c.name.toLowerCase().includes(city.toLowerCase()))
      
    })
  }

  public initFilteredCititesCopy() {
    this.filteredCititesCopy = [...this.filteredCitites].map((c) => {return {...c, name: this.normalizeString(c.name)}}); 
  }

  // Removes diacritical marks (accents) from city names
  normalizeString(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-zA-Z ]/g, '');
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.dialogRef.close(this.form.getRawValue());
  }

  getCountryByName(name: string): Country {
    return this.countries.find((country) => country.name === name);
  }

  getCountryByIso(iso: string): Country {
    return this.countries.find((country) => country.iso.toLowerCase() === iso.toLowerCase());
  }

}

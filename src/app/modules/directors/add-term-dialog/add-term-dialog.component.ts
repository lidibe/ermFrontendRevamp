import { NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter } from '@angular/material/core';
import { DateRange, MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DialogContainerComponent } from 'app/layout/common/dialog-container/dialog-container.component';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-meeting-member-add-dialog',
  templateUrl: './add-term-dialog.component.html',
  styleUrls: ['./add-term-dialog.component.scss'],
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDatepickerModule,
    MatMomentDateModule,
    DialogContainerComponent
  ],
  standalone: true
})
export class AddDirectorsTermDialogComponent implements OnInit {

  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: FormGroup,
    public dialogRef: MatDialogRef<AddDirectorsTermDialogComponent>,
    private _dateAdapter: DateAdapter<DateTime>,
  ) {
    this.form = data;
  }

  ngOnInit() {
  }

  onMonthSelected(date: DateTime, datepicker: MatDatepicker<DateTime>) {
    const threeYearTerm = this._createThreeYearRange(date);
    this.form.patchValue({
      from: threeYearTerm.start,
      to: threeYearTerm.end,
    });
    datepicker.close();
  }

  private _createThreeYearRange(date: DateTime): DateRange<DateTime> {
    const start = date;
    const endDate = date.plus({ years: 3 });
    const end = endDate.minus({ days: 1 });
    return new DateRange<DateTime>(start, end);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    const from = this.form.get('from').value as DateTime;
    const to = this.form.get('to').value as DateTime;
    this.dialogRef.close({ to: to.toISO(), from: from.toISO() });
  }
}

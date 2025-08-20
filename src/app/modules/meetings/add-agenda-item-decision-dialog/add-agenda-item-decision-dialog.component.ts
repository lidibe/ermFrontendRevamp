import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DATETIME_FORMATS, MatDatetimepickerModule } from '@mat-datetimepicker/core';
import { MatMomentDatetimeModule } from '@mat-datetimepicker/moment';
import { DialogContainerComponent } from 'app/layout/common/dialog-container/dialog-container.component';
import moment from 'moment';
import { QuillModule } from 'ngx-quill';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-agenda-item-add-decision-dialog',
  templateUrl: './add-agenda-item-decision-dialog.component.html',
  styleUrls: ['./add-agenda-item-decision-dialog.component.scss'],
  providers: [{
    provide: MAT_DATE_FORMATS,
    useValue: {
        parse: {
            dateInput: moment.ISO_8601
        },
        display: {
            dateInput: 'LL',
            monthYearLabel: 'MMM YYYY',
            dateA11yLabel: 'LL',
            monthYearA11yLabel: 'MMMM YYYY'
        }
    }
},
{
    provide: MAT_DATETIME_FORMATS,
    useValue: {
        parse: {
            dateInput: moment.ISO_8601
        },
        display: {
            dateInput: "L",
            monthInput: "MMMM",
            datetimeInput: "LLL",
            timeInput: "LT",
            monthYearLabel: "MMM YYYY",
            dateA11yLabel: "LL",
            monthYearA11yLabel: "MMMM YYYY",
            popupHeaderDateLabel: "ddd, DD MMM"
        }
    }
}],
  imports: [
    NgIf,
    NgFor, AsyncPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    DialogContainerComponent,
    QuillModule,
    MatMomentDateModule, MatMomentDatetimeModule,
    MatDatepickerModule,MatDatetimepickerModule, MatSelectModule
  ],
  standalone: true
})
export class AddMeetingsAgendaItemDecisionDialogComponent implements OnInit {

  form: FormGroup;
  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{align: []}, {list: 'ordered'}, {list: 'bullet'}],
      ['clean']
    ]
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { form: FormGroup },
    public dialogRef: MatDialogRef<AddMeetingsAgendaItemDecisionDialogComponent>
  ) {
    const { form } = data;
    this.form = form;
  }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    const result = { ...this.form.getRawValue() };
    delete result.code;
    this.dialogRef.close(result);
  }

}

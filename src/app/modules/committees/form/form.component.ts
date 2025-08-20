import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Committee } from '../committees.types';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-committee-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule,
  MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTooltipModule],
  standalone: true
})
export class FormComponent implements OnInit {

  @Output() onSubmit = new EventEmitter();
  @Input() formValues;
  @Input() buttonLabel: string = 'Action';
  @Input() members: any[];
  @Input() roles: any[];
  @Input() selected: Committee;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      label: ['', Validators.required],
      description: ['', Validators.required],
      full_description: ['', Validators.required],
      members: this.fb.array([this.fb.group({
        member: ['', Validators.required],
        role: ['', Validators.required]
      })]),
    });
  }


  ngOnInit(): void {
    if (this.selected) {
      this.form.patchValue(this.selected);
    }
  }

  submit() {
    const data = this.form.getRawValue();
    this.onSubmit.emit(data);
  }

  removeMemberField(index: number): void {
    const membersFormArray = this.form.get('members') as FormArray;

    membersFormArray.removeAt(index);
  }

  addMemberField(): void {
    const memberForm = this.fb.group({
      member: ['', Validators.required],
      role: ['', Validators.required]
    });

    (this.form.get('members') as FormArray).push(memberForm);

  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

}

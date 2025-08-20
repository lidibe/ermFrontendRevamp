import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Group, User } from '../user-groups.types';

@Component({
  selector: 'app-user-groups-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  @Output() onSubmit = new EventEmitter();
  @Input() formValues;
  @Input() buttonLabel: string = 'Action';
  @Input() users: Array<User>;
  @Input() selectedGroup: Group;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      users: ['']
    });
  }


  ngOnInit(): void {
    if (this.selectedGroup) {
      const { name, members } = this.selectedGroup;
      this.form.patchValue({ name, users: members.map(member => member.code) });
    }
  }

  submit() {
    const data = this.form.getRawValue();
    this.onSubmit.emit(data);
  }

}

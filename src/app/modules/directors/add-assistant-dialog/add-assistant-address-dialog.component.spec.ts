import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContactsAssistantDialogComponent } from './add-assistant-address-dialog.component';

describe('AddContactsAssistantDialogComponent', () => {
  let component: AddContactsAssistantDialogComponent;
  let fixture: ComponentFixture<AddContactsAssistantDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddContactsAssistantDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContactsAssistantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMeetingDocumentsDialogComponent } from './add-documents-dialog.component';

describe('AddMeetingDocumentsDialogComponent', () => {
  let component: AddMeetingDocumentsDialogComponent;
  let fixture: ComponentFixture<AddMeetingDocumentsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMeetingDocumentsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMeetingDocumentsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

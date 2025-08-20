import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContactsDocumentDialogComponent } from './add-document-dialog.component';

describe('AddContactsDocumentDialogComponent', () => {
  let component: AddContactsDocumentDialogComponent;
  let fixture: ComponentFixture<AddContactsDocumentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddContactsDocumentDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContactsDocumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

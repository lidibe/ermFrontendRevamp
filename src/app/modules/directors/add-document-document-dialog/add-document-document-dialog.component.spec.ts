import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDirectorsDocumentDocumentDialogComponent } from './add-document-document-dialog.component';

describe('AddContactsDocumentDialogComponent', () => {
  let component: AddDirectorsDocumentDocumentDialogComponent;
  let fixture: ComponentFixture<AddDirectorsDocumentDocumentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDirectorsDocumentDocumentDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDirectorsDocumentDocumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

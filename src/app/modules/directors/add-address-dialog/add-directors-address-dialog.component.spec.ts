import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDirectorsAddressDialogComponent } from './add-directors-address-dialog.component';

describe('AddDirectorsAddressDialogComponent', () => {
  let component: AddDirectorsAddressDialogComponent;
  let fixture: ComponentFixture<AddDirectorsAddressDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDirectorsAddressDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDirectorsAddressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

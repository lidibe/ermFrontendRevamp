import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddDirectorsTermDialogComponent } from './add-term-dialog.component';

describe('AddDirectorsTermDialogComponent', () => {
  let component: AddDirectorsTermDialogComponent;
  let fixture: ComponentFixture<AddDirectorsTermDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDirectorsTermDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDirectorsTermDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

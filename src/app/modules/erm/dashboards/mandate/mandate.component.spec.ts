import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MandateComponent } from './credit.component';

describe('CreditComponent', () => {
  let component: MandateComponent;
  let fixture: ComponentFixture<MandateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MandateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MandateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

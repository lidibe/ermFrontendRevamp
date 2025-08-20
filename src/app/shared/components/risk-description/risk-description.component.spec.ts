import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskDescriptionComponent } from './risk-description.component';

describe('RiskDescriptionComponent', () => {
  let component: RiskDescriptionComponent;
  let fixture: ComponentFixture<RiskDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RiskDescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

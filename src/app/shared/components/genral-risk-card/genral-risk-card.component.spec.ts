import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenralRiskCardComponent } from './genral-risk-card.component';

describe('GenralRiskCardComponent', () => {
  let component: GenralRiskCardComponent;
  let fixture: ComponentFixture<GenralRiskCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenralRiskCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenralRiskCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

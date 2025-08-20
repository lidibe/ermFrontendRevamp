import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskAreaComponent } from './risk-area.component';

describe('RiskAreaComponent', () => {
  let component: RiskAreaComponent;
  let fixture: ComponentFixture<RiskAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RiskAreaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

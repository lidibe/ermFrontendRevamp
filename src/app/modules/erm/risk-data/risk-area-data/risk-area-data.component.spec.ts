import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskAreaDataComponent } from './risk-area-data.component';

describe('RiskAreaDataComponent', () => {
  let component: RiskAreaDataComponent;
  let fixture: ComponentFixture<RiskAreaDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RiskAreaDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskAreaDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

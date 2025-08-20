import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleMixedChartComponent } from './simple-mixed-chart.component';

describe('SimpleMixedChartComponent', () => {
  let component: SimpleMixedChartComponent;
  let fixture: ComponentFixture<SimpleMixedChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleMixedChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleMixedChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

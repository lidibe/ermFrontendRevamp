import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinesChartComponent } from './lines-chart.component';

describe('LinesChartComponent', () => {
  let component: LinesChartComponent;
  let fixture: ComponentFixture<LinesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinesChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

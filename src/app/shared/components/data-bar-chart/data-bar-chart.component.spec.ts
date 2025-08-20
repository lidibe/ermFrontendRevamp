import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataBarChartComponent } from './kri-data-bar-chart.component';

describe('MixedChartComponent', () => {
  let component: DataBarChartComponent;
  let fixture: ComponentFixture<DataBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataBarChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

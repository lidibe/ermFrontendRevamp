import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartWithMarkersComponent } from './bar-chart-with-markers.component';

describe('BarChartWithMarkersComponent', () => {
  let component: BarChartWithMarkersComponent;
  let fixture: ComponentFixture<BarChartWithMarkersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarChartWithMarkersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BarChartWithMarkersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

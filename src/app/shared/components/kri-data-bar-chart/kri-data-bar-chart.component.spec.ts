import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KriDataBarChartComponent } from './kri-data-bar-chart.component';

describe('MixedChartComponent', () => {
  let component: KriDataBarChartComponent;
  let fixture: ComponentFixture<KriDataBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KriDataBarChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KriDataBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

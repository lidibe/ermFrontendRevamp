import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThresholdListComponent } from './list.component';

describe('ListComponent', () => {
  let component: ThresholdListComponent;
  let fixture: ComponentFixture<ThresholdListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThresholdListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThresholdListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

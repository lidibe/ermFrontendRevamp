import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryDataComponent } from './kri.component';

describe('KriComponent', () => {
  let component: SummaryDataComponent;
  let fixture: ComponentFixture<SummaryDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummaryDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

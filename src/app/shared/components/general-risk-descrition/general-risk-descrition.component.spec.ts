import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralRiskDescritionComponent } from './general-risk-descrition.component';

describe('GeneralRiskDescritionComponent', () => {
  let component: GeneralRiskDescritionComponent;
  let fixture: ComponentFixture<GeneralRiskDescritionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralRiskDescritionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralRiskDescritionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplicatedSunComponent } from './complicated-sun.component';

describe('ComplicatedSunComponent', () => {
  let component: ComplicatedSunComponent;
  let fixture: ComponentFixture<ComplicatedSunComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplicatedSunComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplicatedSunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

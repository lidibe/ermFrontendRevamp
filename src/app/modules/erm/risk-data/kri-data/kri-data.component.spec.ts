import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KriDataComponent } from './kri-data.component';

describe('KriDataComponent', () => {
  let component: KriDataComponent;
  let fixture: ComponentFixture<KriDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KriDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KriDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

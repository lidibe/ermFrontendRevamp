import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMeetingsAgendaItemDialogComponent } from './add-agenda-item-dialog.component';

describe('AddMeetingsAgendaItemDialogComponent', () => {
  let component: AddMeetingsAgendaItemDialogComponent;
  let fixture: ComponentFixture<AddMeetingsAgendaItemDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMeetingsAgendaItemDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMeetingsAgendaItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

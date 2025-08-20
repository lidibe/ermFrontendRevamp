import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMeetingsMemberDialogComponent } from './add-member-dialog.component';

describe('AddMeetingsAgendaItemDialogComponent', () => {
  let component: AddMeetingsMemberDialogComponent;
  let fixture: ComponentFixture<AddMeetingsMemberDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMeetingsMemberDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMeetingsMemberDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

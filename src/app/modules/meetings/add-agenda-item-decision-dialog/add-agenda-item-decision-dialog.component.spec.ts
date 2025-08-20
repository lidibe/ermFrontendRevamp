import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMeetingsAgendaItemDecisionDialogComponent } from './add-agenda-item-decision-dialog.component';


describe('AddMeetingsAgendaItemDialogComponent', () => {
  let component: AddMeetingsAgendaItemDecisionDialogComponent;
  let fixture: ComponentFixture<AddMeetingsAgendaItemDecisionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMeetingsAgendaItemDecisionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMeetingsAgendaItemDecisionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

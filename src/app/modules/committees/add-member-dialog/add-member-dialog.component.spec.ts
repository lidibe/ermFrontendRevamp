import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCommitteesMemberDialogComponent } from './add-member-dialog.component';

describe('AddMeetingsAgendaItemDialogComponent', () => {
  let component: AddCommitteesMemberDialogComponent;
  let fixture: ComponentFixture<AddCommitteesMemberDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCommitteesMemberDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCommitteesMemberDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { partition } from "lodash";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { filter, map, switchMap, takeUntil, tap } from "rxjs/operators";
import { DirectorsService } from "../../directors/directors.service";
import { MeetingsService } from "../meetings.service";
import { Meeting, Agenda } from "../meetings.types";
import { NgIf, NgFor, DatePipe, AsyncPipe } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'meetings-full-details',
  templateUrl: './full-details.component.html',
  styleUrls: ['./full-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, RouterLink, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatTooltipModule, MatFormFieldModule, MatExpansionModule, MatCardModule,
    DatePipe, AsyncPipe],
standalone: true
})
export class MeetingsFullDetailsComponent implements OnDestroy, OnInit {
  dateFormat = 'MMM dd, yyyy';

  meeting$: Observable<Meeting>;
  directorRolesById$: Observable<Record<string, any>>;

  private _agendaItems = new BehaviorSubject<Agenda[]>([]);
  private _freestandingDecisions = new BehaviorSubject<Agenda[]>([]);
  private _unsubscribAll$ = new Subject<void>();

  get agendaItems$(): Observable<Agenda[]> {
    return this._agendaItems.asObservable();
  }

  get freestandingDecisions$(): Observable<Agenda[]> {
    return this._freestandingDecisions.asObservable();
  }

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _directorsService: DirectorsService,
    private _meetingsService: MeetingsService,
  ) { }

  ngOnDestroy() {
    this._unsubscribAll$.next();
    this._unsubscribAll$.complete();
  }

  ngOnInit() {
    this.subscribeToDirectorRoles();
    this.subscribeToMeeting();
  }

  private subscribeToDirectorRoles() {
    this.directorRolesById$ = this._directorsService.getDirectorRoles()
      .pipe(
        takeUntil(this._unsubscribAll$),
        map(roles => roles.reduce((byCode, role) => {
          byCode[role.value] = role;
          return byCode;
        }, { })),
      );
  }

  private subscribeToMeeting() {
    this.meeting$ = this._activatedRoute.params.pipe(
      takeUntil(this._unsubscribAll$),
      filter(params => !!params.id),
      map(params => params.id),
      switchMap(code => this._meetingsService.getMeetingById(code)),
      tap(meeting => this.updateAgendaItems(meeting)),
    );
  }

  private updateAgendaItems(meeting: Meeting) {
    if (!meeting.agenda?.length) return;
    const [agendaItems, freestandingDecisions] = partition(meeting.agenda, item => item.title);
    this._agendaItems.next(agendaItems);
    this._freestandingDecisions.next(freestandingDecisions);
  }

  onDocumentsDownloadClick(agendaItem: Agenda) {
    this._meetingsService.downloadAgendaItemDecisionDocumentUrls(agendaItem)
      .pipe(
        takeUntil(this._unsubscribAll$),
        tap(url => window.open(url, '_blank')),
      )
      .subscribe();
  }
}
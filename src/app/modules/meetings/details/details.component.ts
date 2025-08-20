import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { BasicCommitteeDTO, Committee} from 'app/modules/committees/committees.types';
import { Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap, switchMap, take, takeLast, takeUntil, tap } from 'rxjs/operators';
import { Director } from '../../directors/directors.types';
import { AddMeetingsAgendaItemDecisionDialogComponent } from '../add-agenda-item-decision-dialog/add-agenda-item-decision-dialog.component';
import { AddMeetingsAgendaItemDialogComponent } from '../add-agenda-item-dialog/add-agenda-item-dialog.component';
import { AddMeetingDocumentsDialogComponent } from '../add-documents-dialog/add-documents-dialog.component';
import { MeetingsListComponent } from '../list/list.component';
import { MeetingsService } from '../meetings.service';
import { Meeting, Agenda, Decision, MeetingTypeEnum } from '../meetings.types';
import { NgIf, NgFor, DatePipe, NgClass, AsyncPipe, JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatetimepickerModule, MAT_DATETIME_FORMATS } from '@mat-datetimepicker/core';
import { MatMomentDatetimeModule } from '@mat-datetimepicker/moment';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import moment from 'moment';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { DialogConfigService } from 'app/shared/services/dialog-config.service';
import { ConfirmDeleteDialogComponent } from 'app/shared/components/confirml-delete-dialog/confirm-delete-dialog.component';
import { EntityTypeEnum } from 'app/shared/models/entity-type.enum';
import { CommitteesService } from 'app/modules/committees/committees.service';
import { OperationEnum } from 'app/shared/types/operation.types';
import { omit } from 'lodash';
import { UploadedDocumentsComponent } from 'app/shared/components/uploaded-documents/uploaded-documents.component';
import { DocumentationComponent } from 'app/shared/components/document/documentation.component';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { Organization } from 'app/modules/organizations/organizations.types';
import { OrganizationsService } from 'app/modules/organizations/organizations.service';

@Component({
    selector: 'meetings-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
        provide: MAT_DATE_FORMATS,
        useValue: {
            parse: {
                dateInput: moment.ISO_8601
            },
            display: {
                dateInput: 'LL',
                monthYearLabel: 'MMM YYYY',
                dateA11yLabel: 'LL',
                monthYearA11yLabel: 'MMMM YYYY'
            }
        }
    },
    {
        provide: MAT_DATETIME_FORMATS,
        useValue: {
            parse: {
                dateInput: moment.ISO_8601
            },
            display: {
                dateInput: "L",
                monthInput: "MMMM",
                datetimeInput: "LLL",
                timeInput: "LT",
                monthYearLabel: "MMM YYYY",
                dateA11yLabel: "LL",
                monthYearA11yLabel: "MMMM YYYY",
                popupHeaderDateLabel: "ddd, DD MMM"
            }
        }
    }],
    imports: [NgIf, NgFor, RouterLink, ReactiveFormsModule, NgClass,
        MatButtonModule, MatIconModule, MatTooltipModule, MatRippleModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatDatetimepickerModule,
        MatMomentDateModule, MatMomentDatetimeModule, MatChipsModule, MatDividerModule, 
        DatePipe, AsyncPipe, UploadedDocumentsComponent, DocumentationComponent, MatExpansionModule, JsonPipe],
   standalone: true
})
export class MeetingsDetailsComponent implements OnInit, OnDestroy {

    editMode: boolean = false;
    isNewMeeting: boolean = false;

    meeting: Meeting;
    form: FormGroup;
    meetings: Meeting[];
    members: Director[];
    roles: any[];

    membersByCode: { [code: string]: Director };

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public meetingTypeEnum = MeetingTypeEnum;
    committees$: Observable<BasicCommitteeDTO[]>;
    selectedFiles: FileList;
    uploadedDocumentsPanelState: boolean = true;
    uploadDocumentsPanelState: boolean = true;
    @ViewChild('uploadedDocumentsPanel') uploadedDocumentsPanel: MatExpansionPanel;
    @ViewChild('uploadDocumentsPanel') uploadDocumentsPanel: MatExpansionPanel;
    organizations$: Observable<Organization[]>;
    filteredCommittees$: Observable<Committee[]>;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _meetingsListComponent: MeetingsListComponent,
        private _meetingsService: MeetingsService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private dialog: MatDialog,
        private _dialogConfigService: DialogConfigService,
        private _committeesService: CommitteesService,
        private _organizationsService: OrganizationsService,
    ) { }

    ngOnInit() {
        this.initComponentData();
        this.initForm();
        this.openDrawer();
        this.committees$ = this._committeesService.getAllNonDeletedCommittees();
        this.subscribeToRouterStateChanges();
        this.organizations$ = this._organizationsService.getOrganizations(of({page: 1, limit:100})).pipe(map(res => res.data));
        if (this.meeting.organizationCode) this.filteredCommittees$ = this._committeesService.getCommitteesByOrgCode(this.meeting.organizationCode)
    }

    subscribeToRouterStateChanges() {
        this._router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll),
            )
            .subscribe(() => {
                const state = this._router.getCurrentNavigation()?.extras.state;
                if (state && state['editMode'] !== undefined) {
                    this.editMode = state['editMode'];
                } else {
                    this.editMode = this.isNewMeeting;
                }
            });
    }

    private initComponentData() {
        this.initEditMode();
        this._activatedRoute.data.pipe(
            takeUntil(this._unsubscribeAll),
            tap(data => this.initFromRouteData(data)),
            tap(() => this._changeDetectorRef.markForCheck()),
        )
        .subscribe();
    }

    private initEditMode() {
        this.isNewMeeting = this._activatedRoute.snapshot.params.id === 'new';
        this.editMode = this.isNewMeeting;
    }

    private initFromRouteData(data: any) {
        this.initMeeting(data);
    }

    private initMeeting(data: any) {
        this.meeting = data.meeting;
    }

    private initForm() {
        this.form = this._formBuilder.group({
            _id: [''],
            code: [''],
            title: ['', Validators.required],
            starting_at: ['', Validators.required],
            agenda: this._formBuilder.array([]),
            decisions: this._formBuilder.array([]),
            members: this._formBuilder.array([]),
            ending_at: ['', Validators.required],
            type: ['', Validators.required],
            committee: [''],
            name: [''],
            organizationCode: [''],
        }/* ,{ validators: startDateBeforeEndDateValidator } */);

    }

    private initFormForUpdate() {
        this.form.patchValue(this.meeting);
        this.initFormForUpdateForAgendaItems();
        this.initFormForUpdateForDecisions();
    }

    private initFormForUpdateForAgendaItems() {
        const agendaGroup = this.form.get('agenda') as FormArray;
        while (agendaGroup.length) {
            agendaGroup.removeAt(0);
        }
        if (this.meeting?.agenda?.length) {
            for (const agendaItem of this.meeting.agenda) {
                if (!agendaItem.title) continue;
    
                const controls = this.createAgendaItemForm();
                controls.patchValue(agendaItem as Partial<{
                    code: string;
                    title: string;
                    full_description: string;
                    decision: null;
                }>);
                agendaGroup.push(controls);
            }
        }
    }

    private initFormForUpdateForDecisions() {
        const decisionsGroup = this.form.get('decisions') as FormArray;

        while (decisionsGroup.length) {
            decisionsGroup.removeAt(0);
        }
    
        if (this.meeting?.agenda?.length) {
            for (const agendaItem of this.meeting.agenda) {
                if (agendaItem.title) continue;
                const controls = this.createAgendaItemForm();
                controls.get('title').setValue('.')
                controls.get('full_description').setValue('.')
                controls.patchValue(agendaItem as Partial<{ code: string; decision: null; }>);
                decisionsGroup.push(controls);
            }
        }
    }

    private openDrawer() {
        this._meetingsListComponent.matDrawer.open();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._meetingsListComponent.matDrawer.close();
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        !this.isNewMeeting && this.initFormForUpdate();
    }

    updateMeeting() {
        const meeting = this.form.getRawValue();

        const newMeeting = {
            ...omit(meeting, ['_id', 'code', 'members', 'agenda', 'decisions']),
            meeting_no: 1,
            description: '.',
            full_description: '.'
          } as Meeting;

        if (this.isNewMeeting) {
            this.createMeeting(newMeeting);
            return;
        }

        this._meetingsService.updateMeeting(meeting.code, newMeeting)
            .pipe(
                take(1),
                tap(() => this.finaliseUpdate()),
            )
            .subscribe();
    }


    private finaliseUpdate() {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
        this.closeDrawer();
        this._changeDetectorRef.markForCheck();
    }

    createMeeting(meeting: Meeting) {
        this._meetingsService.createMeeting(meeting)
            .pipe(
                take(1),
                tap(meet => this.finaliseCreate(meet)),
            )
            .subscribe();
    }

    private finaliseCreate(meeting: Meeting) {
        this._router.navigate(['../'], {
            queryParams: { select: meeting.code },
            relativeTo: this._activatedRoute,
        });
        this._changeDetectorRef.markForCheck();
    }

    async deleteMeeting(): Promise<void> {

        const dialogConfig = await this._dialogConfigService.getDialogConfig(EntityTypeEnum.MEETING);
      
        this.dialog.open(ConfirmDeleteDialogComponent, dialogConfig)
        .afterClosed()
        .pipe(
            take(1),
            filter(Boolean),
            switchMap((reason) => this._meetingsService.deleteMeeting(this.meeting.code, reason)
            ),
            tap(() => this._changeDetectorRef.markForCheck()),
        )
        .subscribe((isDeleted) => {

            if (!isDeleted) {
                return;
            }
                this._router.navigate(['../'], { relativeTo: this._activatedRoute });

            this.toggleEditMode();
        });
      this._changeDetectorRef.markForCheck(); 
    }

    addAgendaItemField(): void {
        const form = this.createAgendaItemForm();
        this.openNewAgendaItemDialog(form);
    }

    private createAgendaItemForm(init?: Agenda) {
        return this._formBuilder.group({
            code: [init?.code || ''],
            title: [init?.title || '', Validators.required],
            full_description: [init?.full_description || '', Validators.required],
            decision: [this._formBuilder.group({})],
            is_activated: [true]
        });
    }

    private async openNewAgendaItemDialog(form: FormGroup) {
        const agendaItemGroup = this.form.get('agenda') as FormArray;
        const meetingCode = this.meeting.code;
        const dialogConfig = await this._dialogConfigService.getDialogConfig(form);
        this.dialog.open(AddMeetingsAgendaItemDialogComponent, dialogConfig)
            .afterClosed()
            .pipe(
                take(1),
                filter(Boolean),
                switchMap(newAgendaItem => this._meetingsService
                    .createAgendaItem(meetingCode, newAgendaItem as Agenda)),
                tap(() => agendaItemGroup.push(form)),
                tap(agenda => form.get('code').setValue(agenda.code)),
                tap(() => this._changeDetectorRef.markForCheck()),
            )
            .subscribe();
        this._changeDetectorRef.markForCheck();
    }

    editAgendaItemField(index: number) {
        const agendaItemGroup = this.form.get('agenda') as FormArray;
        const agendaItem = agendaItemGroup.controls[index];
        this.openEditAgendaItemDialog(agendaItem);
    }

    private async openEditAgendaItemDialog(form: AbstractControl) {
        const meetingCode = this.meeting.code;
        const agendaItemCode = form.get('code').value;
        const dialogConfig = await this._dialogConfigService.getDialogConfig(form);
        this.dialog.open(AddMeetingsAgendaItemDialogComponent, dialogConfig)
            .afterClosed()
            .pipe(
                take(1),
                filter(Boolean),
                switchMap(result => this._meetingsService
                    .editAgendaItem(meetingCode, agendaItemCode, result as Agenda)),
                tap(() => this._changeDetectorRef.markForCheck()),
            )
            .subscribe();
        this._changeDetectorRef.markForCheck();
    }

    addAgendaItemDocumentField(itemIndex: number, agendaItemsGroup: FormArray) {
        this.openAgendaItemDocumentDialog(itemIndex, agendaItemsGroup);
    }

    private async openAgendaItemDocumentDialog(itemIndex: number, agendaItemsGroup: FormArray) {
        const item = agendaItemsGroup.value[itemIndex] as Agenda;
        const dialogConfig = await this._dialogConfigService.getDialogConfig(null);
        this.dialog.open(AddMeetingDocumentsDialogComponent, dialogConfig)
            .afterClosed()
            .pipe(
                take(1),
                filter(Boolean),
                switchMap(result =>
                    this.createAgendaItemDocuments(item.code, result as FileList)),
                tap(() => this._changeDetectorRef.markForCheck()),
            )
            .subscribe();
        this._changeDetectorRef.markForCheck();
    }

    private createAgendaItemDocuments(
        agendaItemCode: string,
        files: FileList,
    ): Observable<{ code: string }[]> {
        let documentCodes = [];
        const meetingCode = this.meeting.code;
        return this._meetingsService.uploadDocuments(files)
            .pipe(
                tap(documentCode => documentCodes.push({ code: documentCode })),
                mergeMap(documentCode => this._meetingsService
                    .createAgendaItemDocument(meetingCode, agendaItemCode, documentCode)),
                takeLast(1),
                map(() => documentCodes),
            );
    }

    performAgendaItemOperation(
        index: number,
        agendaItemGroup: FormArray,
        operation: OperationEnum
      ) {
        const meetingCode = this.meeting.code;
        const agendaItem = agendaItemGroup.value[index] as Agenda;
      
        const operation$ = operation === 'delete' ?
          this._meetingsService.deleteAgendaItem(meetingCode, agendaItem.code) :
          this._meetingsService.deactivateAgendaItem(meetingCode, agendaItem.code);
      
        operation$
          .pipe(
            take(1),
            tap(() => operation === OperationEnum.DELETE && agendaItemGroup.removeAt(index)),
            tap(() => this._changeDetectorRef.markForCheck()),
          )
          .subscribe(() => {
            operation === OperationEnum.DEACTIVATE && agendaItemGroup.at(index).patchValue({is_activated: false});
            this._changeDetectorRef.markForCheck();
          });
      }
      

      removeAgendaItemField(index: number, agendaItemGroup: FormArray) {
        this.performAgendaItemOperation(index, agendaItemGroup, OperationEnum.DELETE);
      }
      
      deactivateAgendaItemField(index: number, agendaItemGroup: FormArray) {
        this.performAgendaItemOperation(index, agendaItemGroup, OperationEnum.DEACTIVATE);
      }
      

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    addDecision() {
        const form = this.createAgendaItemDecisionForm();
        this.openNewDecisionDialog(form);
    }

    private async openNewDecisionDialog(form: FormGroup) {
        const data = { form };
        const agendaItemGroup = this.form.get('decisions') as FormArray;
        const meetingCode = this.meeting.code;
        const dialogConfig = await this._dialogConfigService.getDialogConfig(data);
        this.dialog.open(AddMeetingsAgendaItemDecisionDialogComponent, dialogConfig)
            .afterClosed()
            .pipe(
                take(1),
                filter(Boolean),
                switchMap(decision => this._meetingsService
                    .createDecision(meetingCode, decision as Decision)),
                tap(() => agendaItemGroup.push(form)),
                tap(agenda => form.get('code').setValue(agenda.code)),
                tap(() => this._changeDetectorRef.markForCheck()),
            )
            .subscribe();
        this._changeDetectorRef.markForCheck();
    }

    editAgendaItemDecision(agendaIndex: number, agendaItemsGroup: FormArray) {
        const agendaItemControl = agendaItemsGroup.controls[agendaIndex];
        const decision = agendaItemsGroup.value[agendaIndex].decision as Decision;
        const form = this.createAgendaItemDecisionForm(decision);
        this.openEditAgendaItemDecisionDialog(
            agendaIndex,
            agendaItemsGroup,
            form,
            () => agendaItemControl.get('decision').setValue(form.value)
        );
    }

    private createAgendaItemDecisionForm(init?: Decision): FormGroup {
        return this._formBuilder.group({
            code: [init?.code || ''],
            owner: [init ? init.owner : ''],
            due_at: [init ? init.due_at : ''],
            description: [init ? init.description : '', Validators.required],
        });
    }

    private async openEditAgendaItemDecisionDialog(
        agendaItemIndex: number,
        agendaItemGroup: FormArray,
        form: FormGroup,
        doAfterUpdate: (result: any) => void,
    ) {
        const data = { form };
        const meetingCode = this.meeting.code;
        const agendaItemControl = agendaItemGroup.controls[agendaItemIndex];
        const agendaItem = agendaItemControl.value as Agenda;
        const agendaItemCode = agendaItem.code;
        const decisionCode = agendaItem.decision.code;
        const dialogConfig = await this._dialogConfigService.getDialogConfig(data);
        this.dialog.open(AddMeetingsAgendaItemDecisionDialogComponent, dialogConfig)
            .afterClosed()
            .pipe(
                take(1),
                filter(Boolean),
                switchMap(result => this._meetingsService.updateAgendItemDecision(
                    meetingCode,
                    agendaItemCode,
                    decisionCode,
                    result as Decision
                )),
                tap(result => doAfterUpdate(result)),
                tap(() => this._changeDetectorRef.markForCheck()),
            )
            .subscribe();
        this._changeDetectorRef.markForCheck();
    }

    agendaItemHasDecision(item: Agenda): boolean {
        return !!item.decision?.owner;
    }
    get meetingTypeKeys() {
        return this._meetingsService.getMeetingTypeKeys();
      }

    uploadFile(event) {
        this.selectedFiles = event;
        this._meetingsService.uploadDocuments(this.selectedFiles)
            .pipe(
                mergeMap(documentCode => this._meetingsService
                    .createMeetingDocument(this.meeting.code, {doc_code: documentCode, doc_name: this.selectedFiles[0]?.name, doc_type: this.selectedFiles[0]?.type})),
            ).subscribe((res) => {
                this.uploadedDocumentsPanel.open();
                this.uploadDocumentsPanel.close();
                this.meeting.documents = res?.documents;
            });
      }
      getStartDate() {
        return this.form?.get('starting_at')?.value;
     }
     unArchiveMeeting() {
        this._meetingsService.unArchiveMeeting(this.meeting?.code).
        pipe(take(1), tap(() => this.finaliseUpdate())).subscribe(); 
     }

     onOrgChange(orgCode: string): void {
        this.filteredCommittees$ = this._committeesService.getCommitteesByOrgCode(orgCode);
    }
}

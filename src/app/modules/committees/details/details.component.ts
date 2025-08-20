import { AsyncPipe, CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import {  Observable, of, Subject } from 'rxjs';
import { Committee, Member } from '../committees.types';
import { Director, Role } from 'app/modules/directors/directors.types';
import { CommitteesListComponent } from '../list/list.component';
import { CommitteesService } from '../committees.service';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { AddMeetingsMemberDialogComponent } from '../../meetings/add-member-dialog/add-member-dialog.component';
import { MatDividerModule } from '@angular/material/divider';
import { DialogConfigService } from 'app/shared/services/dialog-config.service';
import { ConfirmDeleteDialogComponent } from 'app/shared/components/confirml-delete-dialog/confirm-delete-dialog.component';
import { EntityTypeEnum } from 'app/shared/models/entity-type.enum';
import { QuillModule } from 'ngx-quill';
import { OrganizationsService } from 'app/modules/organizations/organizations.service';
import { Organization } from 'app/modules/organizations/organizations.types';
import { DirectorsService } from 'app/modules/directors/directors.service';

@Component({
    selector       : 'contacts-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports        : [CommonModule, RouterLink, ReactiveFormsModule,
      MatButtonModule, MatTooltipModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDividerModule,
      AsyncPipe, QuillModule],
    standalone     : true
})
export class CommitteesDetailsComponent implements OnInit, OnDestroy
{
  committee: Committee;
  form: FormGroup;
  members: Director[];
  membersByCode: { [code: string]: Director };
  roles: any[];

  editMode = false;
  isNewCommittee = false;

  private _unsubscribeAll = new Subject<any>();
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{align: []}, {list: 'ordered'}, {list: 'bullet'}],
      ['clean']
    ]
  };

  organizations$: Observable<Organization[]>;
  Role  = Role;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _committeesListComponent: CommitteesListComponent,
    private _committeesService: CommitteesService,
    private _dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _dialogConfigService: DialogConfigService,
     private _organizationsService: OrganizationsService,
     private _directorsService: DirectorsService,
  ) { }

  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  ngOnInit() {
    this.initComponentData();
    this.initForm();
    this.openDrawer();
    this.subscribeToRouterStateChanges();
     this.organizations$ = this._organizationsService.getOrganizations(of({page: 1, limit:100})).pipe(map(res => res.data));
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
                this.editMode = this.isNewCommittee;
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
    this.isNewCommittee = this._activatedRoute.snapshot.paramMap.get('id') === 'new';
    this.editMode = this.isNewCommittee;
  }

  private initFromRouteData(data: any) {
    this.initCommittee(data);
    this.initMembers(data);
    this.initRoles(data);
  }

  private initCommittee(data: any) {
    this.committee = data.committee;
  }

  private initMembers(data: any) {
    this.members = data.members;
    this.membersByCode = this.members.reduce((byCode, member) => {
      byCode[member.code] = member;
      return byCode;
    }, { });
  }

  private initRoles(data: any) {
    this.roles = data.roles;
  }

  private initForm() {
    this.form = this._formBuilder.group({
      _id: [''],
      code: [''],
      name: ['', Validators.required],
      label: [''],
      description: ['', Validators.required],
      full_description: [''],
      organization_codes: []
    });
  }

  private initFormForUpdates() {
    this.initFormMembersForUpdates();
    this.form.patchValue(this.committee);
  }

  private initFormMembersForUpdates() {
    let membersGroup = this.form.get('members') as FormArray;
    if (!membersGroup) {
      membersGroup = this._formBuilder.array([]);
      this.form.addControl('members', membersGroup);
    } else {
      membersGroup.clear();
    }
    if (this.committee?.members && this.committee?.members?.length) {
      for (let member of this.committee.members) {
        this.addMemberField({ member: member.code, role: member.role });
      }
    }
  }

  private openDrawer() {
    this._committeesListComponent.matDrawer.open();
  }

  closeDrawer(): Promise<MatDrawerToggleResult> {
    return this._committeesListComponent.matDrawer.close();
  }

  getCommitteeMembers(): Observable<Director[]> {
    return this._committeesService.filterCommitteeMembers(this.committee, this.members);
  }

  trackByCode(index: number, item: any): any {
    return item.code || index;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    !this.isNewCommittee && this.initFormForUpdates();
  }

  addMember() {
    const form = this.createMemberForm();
    this.openNewMemberDialog(form);
  }

  private createMemberForm(): FormGroup {
    return this._formBuilder.group({
        member: ['', Validators.required],
        role: ['', Validators.required]
    });
  }

  private async openNewMemberDialog(form: FormGroup): Promise<void> {
    const data = { form, directors: this.members, roles: this.roles };
    const membersGroup = this.form.get('members') as FormArray;

    const dialogConfig = await this._dialogConfigService.getDialogConfig(data);
    
    this._dialog.open(AddMeetingsMemberDialogComponent, dialogConfig)
      .afterClosed()
      .pipe(
          take(1),
          filter(Boolean),
          switchMap(member => this._committeesService
            .addCommitteeMember(this.committee.code, member as Member)
          ),
          tap(() => form.disable()),
          tap(() => membersGroup.push(form)),
          tap(() => this._changeDetectorRef.markForCheck()),
      )
      .subscribe();
    this._changeDetectorRef.markForCheck();
  }

  private addMemberField(init?: { member: string, role: string }) {
    const memberValue = init ? init.member : '';
    const roleValue = init ? init.role : '';
    const memberForm = this._formBuilder.group({
      member: [memberValue, Validators.required],
      role: [roleValue, Validators.required],
    });
    memberForm.disable();
    const membersGroup = this.form.get('members') as FormArray
    membersGroup.push(memberForm);
    this._changeDetectorRef.markForCheck();
  }

  removeMember(index: number) {
    const committeeCode = this.committee.code;
    const members = this.form.get('members').value as Member[];
    this._committeesService.deleteCommitteeMember(committeeCode, members[index]['member'])
      .pipe(
        take(1),
        tap(() => this.removeMemberField(index)),
      )
      .subscribe();
  }

  private removeMemberField(index: number) {
    const membersGroup = this.form.get('members') as FormArray;
    membersGroup.removeAt(index);
    this._changeDetectorRef.markForCheck();
  }

  saveCommittee() {
    const committee = this.form.value as Committee;
    const savedCommittee = this.isNewCommittee
      ? this._committeesService.createCommittee(committee)
      : this._committeesService.updateCommittee(committee);
    savedCommittee.pipe(
      take(1),
      tap(committee => this.finaliseSumbission(committee)),
    ).subscribe();
  }

  private finaliseSumbission(committee: Committee) {
    if (this.isNewCommittee) this.finaliseCreate(committee);
    else this.finaliseUpdate();
  }

  private finaliseCreate(committee: Committee) {
    this._router.navigate(['../'], {
      queryParams: { select: committee.code },
      relativeTo: this._activatedRoute,
    });
    this._changeDetectorRef.markForCheck();
  }

  private finaliseUpdate() {
    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
    this.closeDrawer();
    this._changeDetectorRef.markForCheck();
  }

  async deleteCommittee() {
    if (this.isNewCommittee) return;

      const dialogConfig = await this._dialogConfigService.getDialogConfig(EntityTypeEnum.COMMITTEE);
    
      this._dialog.open(ConfirmDeleteDialogComponent, dialogConfig)
        .afterClosed()
        .pipe(
            take(1),
            filter(Boolean),
            switchMap((reason) => this._committeesService.deleteCommitteeById(this.committee.code, reason)
            ),
            tap(committee => this.finaliseSumbission(committee)),
            tap(() => this._changeDetectorRef.markForCheck()),
        )
        .subscribe();
      this._changeDetectorRef.markForCheck();
  }

  unArchiveCommittee() {
    this._committeesService.unArchiveCommittee(this.committee?.code).
    pipe(take(1), tap(() => this.finaliseUpdate())).subscribe();
  }

  setRole(committeeCode: string, directorCode: string, currentRole: string) {
    const newRole = currentRole === Role.CHAIRMAN ? Role.MEMBER : Role.CHAIRMAN;
    this._directorsService.setRole(directorCode, committeeCode, newRole).
    pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.initCommittee({committee: res})
    });
  }
}

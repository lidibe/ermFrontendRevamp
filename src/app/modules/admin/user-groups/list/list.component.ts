import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil, finalize, take } from 'rxjs/operators';
import { AddDialogComponent } from '../add-dialog/add-dialog.component';
import { UserGroupsService } from '../user-groups.service';
import { Group, GroupAndUsers, User } from '../user-groups.types';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  animations: fuseAnimations,
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {

  isUserLoading = false;
  isGroupLoading = false;
  isAddGroupLoading = false;
  isUpdateGroupLoading = false;
  riskAreasCount = 0;
  users: Array<User>;
  groups: Array<Group>;
  selectedGroup: Group;
  columns = ['name', 'members', 'details'];

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(private userGroupsService: UserGroupsService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.isGroupLoading = true;
    this.userGroupsService
      .getGroups()
      .pipe(
        takeUntil(this._unsubscribeAll),
        finalize(() => this.isGroupLoading = false),
      ).subscribe(res => this.groups = res);

    this.isUserLoading = true
    this.userGroupsService.getUsers()
      .pipe(
        takeUntil(this._unsubscribeAll),
        finalize(() => this.isUserLoading = false),
      )
      .subscribe(res => this.users = res);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(0);
    this._unsubscribeAll.complete();
  }

  createUserGroup() {
    this.dialog
      .open(AddDialogComponent, { data: this.users })
      .afterClosed()
      .subscribe((res: GroupAndUsers) => {
        if (!res) return;

        this.isAddGroupLoading = true;
        this.userGroupsService
          .createGroupWithUsers(res)
          .pipe(
            take(1),
            finalize(() => this.isAddGroupLoading = false)
          )
          .subscribe((res: Array<Group>) => {
            const group = res[res.length - 1];
            this.groups = [group, ...this.groups];

          });
      });
  }

  onUpdate(values) {


    this.isUpdateGroupLoading = true;
    this.userGroupsService.updateGroupAndUsers(this.selectedGroup, values)
      .pipe(
        take(1),
        finalize(() => this.isUpdateGroupLoading = false)
      )
      .subscribe(() => {
        this.updateCurrentList(values);
      });
  }

  private updateCurrentList(values: any) {
    this.groups[this.groups.indexOf(this.selectedGroup)];

    const updatedIndex = this.groups.indexOf(this.selectedGroup);

    this.selectedGroup.name = values.name;
    this.selectedGroup.members = values.users.map(code => ({ code }));

    this.groups = [
      ...this.groups.slice(0, updatedIndex),
      this.selectedGroup,
      ...this.groups.slice(updatedIndex + 1, this.groups.length)
    ];
  }

  toggleDetails(group: Group) {
    if (this.selectedGroup && this.selectedGroup.code === group.code) {
      this.selectedGroup = undefined;
      return;
    }
    this.selectedGroup = group;
  }

}

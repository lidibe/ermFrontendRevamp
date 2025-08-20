import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserGroupsComponent } from './user-groups.component';
import { userGroupsRoutes } from './user-groups.routing';
import { ListComponent } from './list/list.component';
import { SharedModule } from 'app/shared/shared.module';
import { AddDialogComponent } from './add-dialog/add-dialog.component';
import { FormComponent } from './form/form.component';



@NgModule({
  declarations: [
    UserGroupsComponent,
    ListComponent,
    AddDialogComponent,
    FormComponent
  ],
  imports: [
    RouterModule.forChild(userGroupsRoutes),
    SharedModule,
    CommonModule
  ]
})
export class UserGroupsModule { }

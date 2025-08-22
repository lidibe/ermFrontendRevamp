import { Route } from '@angular/router';
import { ListComponent } from './list/list.component';
import { UserGroupsComponent } from './user-groups.component';

export const userGroupsRoutes: Route[] = [
  {
    path: '',
    component: UserGroupsComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'management' },
      { path: 'management', component: ListComponent },
    ],
  },
];

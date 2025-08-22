import { Route } from '@angular/router';
import { ListComponent } from './list/list.component';
import { UserGroupsComponent } from './user-groups.component';

export const userGroupsRoutes: Route[] = [
  {
    path: '',
    component: UserGroupsComponent,   // shell / layout that contains <router-outlet>
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'management' }, // redirect ONLY
      { path: 'management', component: ListComponent },          // component ONLY
    ],
  },
];

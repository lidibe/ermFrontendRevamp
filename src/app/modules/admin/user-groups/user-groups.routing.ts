import { Route } from '@angular/router';
import { ListComponent } from './list/list.component';
import { UserGroupsComponent } from './user-groups.component';

export const userGroupsRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'management',
        component: UserGroupsComponent,
    },

    {
        path: 'management',
        component: ListComponent
    }
];

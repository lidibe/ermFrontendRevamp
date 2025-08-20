import { Routes } from '@angular/router';
import { OrganizationsComponent } from './organizations.component';
import { OrganizationsListComponent } from './list/list.component';
import { OrganizationsOrganizationResolver } from './organizations.resolvers';
import { CanDeactivateOrganizationsDetails } from './organizations.guards';
import { OrganizationsDetailsComponent } from './details/details.component';
import { OrganizationsTrailsComponent } from './trails/trails.component';

export default [
    {
        path: '',
        component: OrganizationsComponent,
        resolve: {
        },
        children : [
          {
            path: '',
            component: OrganizationsListComponent,
            resolve: {
            },
            children: [
              {
                path: ':id',
                component: OrganizationsDetailsComponent,
                resolve: {
                  organization: OrganizationsOrganizationResolver,
                },
                canDeactivate: [CanDeactivateOrganizationsDetails]
              },
              {
                path         : ':code/trails',
                component    : OrganizationsTrailsComponent,
              },
            ]
          }
        ]
      },
] as Routes;

import { Routes } from '@angular/router';
import { CommitteesComponent } from './committees.component';
import { CommitteesListComponent } from './list/list.component';
import { CommitteesCommitteeResolver, CommitteesMembersResolver, CommitteesRolesResolver } from './committees.resolvers';
import { CanDeactivateCommitteesDetails } from './committees.guards';
import { CommitteesDetailsComponent } from './details/details.component';
import { CommitteesTrailsComponent } from './trails/trails.component';

export default [
    {
        path: '',
        component: CommitteesComponent,
        resolve: {
        },
        children : [
          {
            path: '',
            component: CommitteesListComponent,
            resolve: {
            },
            children: [
              {
                path: ':id',
                component: CommitteesDetailsComponent,
                resolve: {
                  committee: CommitteesCommitteeResolver,
                  members: CommitteesMembersResolver,
                  roles: CommitteesRolesResolver,
                },
                canDeactivate: [CanDeactivateCommitteesDetails]
              },
              {
                path         : ':code/trails',
                component    : CommitteesTrailsComponent,
              },
            ]
          }
        ]
      },
] as Routes;

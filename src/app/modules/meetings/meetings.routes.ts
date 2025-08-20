import { Routes } from '@angular/router';

import { MeetingsFullDetailsComponent } from './full-details/full-details.component';
import { MeetingsDetailsComponent } from './details/details.component';
import { MeetingsListComponent } from './list/list.component';
import { MeetingComponent } from './meetings.component';
import { CanDeactivateMeetingsDetails } from './meetings.guards';
import { MeetingsMeetingResolver, MeetingsMembersResolver, MeetingsRolesResolver } from './meetings.resolvers';
import { MeetingsTrailsComponent } from './trails/trails.component';

export default [
    {
        path     : '',
        component: MeetingComponent,
        resolve  : {
        },
        children : [
            {
                path     : '',
                component: MeetingsListComponent,
                resolve  : {
                },
                children : [
                    {
                        path         : ':id',
                        component    : MeetingsDetailsComponent,
                        resolve      : {
                            meeting  : MeetingsMeetingResolver,
                            members  : MeetingsMembersResolver,
                            roles    : MeetingsRolesResolver,
                        },
                        canDeactivate: [CanDeactivateMeetingsDetails]
                    },
                    {
                        path         : ':code/trails',
                        component    : MeetingsTrailsComponent,
                    },
                ]
            },
            {
                path       : ':id/full',
                component  : MeetingsFullDetailsComponent,
            }
        ]
    }
] as Routes;

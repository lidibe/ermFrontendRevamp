import { Route } from '@angular/router';
import {RiskAreaComponent} from './risk-area/risk-area.component';
import {RiskAreaListComponent} from './risk-area/list/list.component';
import {KriComponent} from './kri/kri.component';
import {KriListComponent} from './kri/list/list.component';
import {KriResolver, KrisKriResolver, KrisRiskAreaResolver} from './kri/kri.resolvers';
import {KriDetailsComponent} from './kri/details/details.component';
import {CanDeactivateKriDetails} from './kri/kri.guards';
import {RiskAreasResolver} from './risk-area/risk-area.resolvers';
import {ThresholdComponent} from './threshold/threshold.component';
import {ThresholdListComponent} from './threshold/list/list.component';
import {ThresholdsResolver} from './threshold/threshold.resolvers';

export const masterDataRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'kri'
    },
    {
        path     : 'kri',
        component: KriComponent,
        children : [
            {
                path     : '',
                component: KriListComponent,
                resolve  : {
                    tasks    : KriResolver,
                    countries: KrisRiskAreaResolver
                },
                children : [
                    {
                        path         : ':id',
                        component    : KriDetailsComponent,
                        resolve      : {
                            task     : KrisKriResolver,
                            riskAreas: KrisRiskAreaResolver
                        },
                        canDeactivate: [CanDeactivateKriDetails]
                    }
                ]
            }
        ]
    },
    {
        path     : 'risk-area',
        component: RiskAreaComponent,
        children : [
            {
                path     : '',
                component: RiskAreaListComponent,
                resolve: {
                    riskAreas: RiskAreasResolver
                }
            }
        ]
    },
    {
        path     : 'threshold',
        component: ThresholdComponent,
        children : [
            {
                path     : '',
                component: ThresholdListComponent,
                resolve: {
                    thresholds: ThresholdsResolver
                }
            }
        ]
    }
];

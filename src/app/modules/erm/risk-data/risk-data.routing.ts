import { Route } from '@angular/router';
import {KriDataComponent} from './kri-data/kri-data.component';
import {KriDataListComponent} from './kri-data/list/list.component';
import {KriDatasResolver} from './kri-data/kri-data.resolvers';
import {RiskAreaDatasResolver} from './risk-area-data/risk-area-data.resolvers';
import {RiskAreaDataComponent} from './risk-area-data/risk-area-data.component';
import {RiskAreaDataListComponent} from './risk-area-data/list/list.component';
import {RiskAreasResolver} from '../master-data/risk-area/risk-area.resolvers';
import {SummaryDataComponent} from './summary-data/summary-data.component';
import {KrisRiskAreaResolver} from '../master-data/kri/kri.resolvers';
import {SummaryDataListComponent} from './summary-data/list/list.component';
import {
    SummaryDataResolver,
    SummaryDatasRiskAreaResolver,
    SummaryDatasSummaryDataResolver
} from './summary-data/summary-data.resolvers';
import {SummaryDataDetailsComponent} from './summary-data/details/details.component';
import {CanDeactivateSummaryDataDetails} from './summary-data/summary-data.guards';

export const riskDataRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'kri-data'
    },
    {
        path     : 'kri-data',
        component: KriDataComponent,
        children : [
            {
                path     : '',
                component: KriDataListComponent,
                resolve  : {
                    kriDatas    : KriDatasResolver,
                }
            }
        ]
    },
    {
        path     : 'risk-area-data',
        component: RiskAreaDataComponent,
        children : [
            {
                path     : '',
                component: RiskAreaDataListComponent,
                resolve  : {
                    riskAreaDatas    : RiskAreaDatasResolver,
                    riskAreas: RiskAreasResolver,
                }
            }
        ]
    },
    {
        path     : 'summary-data',
        component: SummaryDataComponent,
        children : [
            {
                path     : '',
                component: SummaryDataListComponent,
                resolve  : {
                    tasks    : SummaryDataResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : SummaryDataDetailsComponent,
                        resolve      : {
                            task     : SummaryDatasSummaryDataResolver,
                        },
                        canDeactivate: [CanDeactivateSummaryDataDetails]
                    }
                ]
            }
        ]
    },
];

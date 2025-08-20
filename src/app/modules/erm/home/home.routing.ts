import { Route } from '@angular/router';
import { ErmHomeComponent } from './home.component';
import {KriDatasResolver} from '../risk-data/kri-data/kri-data.resolvers';

export const ermHomeRoutes: Route[] = [
    {
        path     : '',
        component: ErmHomeComponent,
        resolve  : {
            kriDatas    : KriDatasResolver,
        }
    }
];

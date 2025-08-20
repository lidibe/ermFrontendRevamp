import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import {DashboardComponent} from './dashboard.component';
import {dashboardRoutes} from './dashboard.routing';
import {TreoAlertModule} from '../../../../@treo/components/alert';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';

@NgModule({
    declarations: [
        DashboardComponent
    ],
    imports: [
        RouterModule.forChild(dashboardRoutes),
        SharedModule,
        TreoAlertModule,
        MatIconModule,
        MatMenuModule
    ]
})
export class DashboardModule
{
}

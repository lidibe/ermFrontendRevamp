import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import {masterDataRoutes} from './master-data.routing';
import {RiskAreaComponent} from './risk-area/risk-area.component';
import {RiskAreaListComponent} from './risk-area/list/list.component';
import {KriComponent} from './kri/kri.component';
import {KriListComponent} from './kri/list/list.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {KriDetailsComponent} from './kri/details/details.component';
import { ThresholdComponent } from './threshold/threshold.component';
import { ThresholdListComponent } from './threshold/list/list.component';
import { FuseAlertComponent } from '@fuse/components/alert';
import { TextFieldModule } from '@angular/cdk/text-field';


@NgModule({
    declarations: [
        KriComponent,
        KriListComponent,
        KriDetailsComponent,
        RiskAreaComponent,
        RiskAreaListComponent,
        ThresholdComponent,
        ThresholdListComponent,
    ],
    imports: [
        RouterModule.forChild(masterDataRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTableModule,
        MatTooltipModule,
        SharedModule,
        MatSidenavModule,
        FuseAlertComponent,
        TextFieldModule
    ]
})
export class MasterDataModule
{
}

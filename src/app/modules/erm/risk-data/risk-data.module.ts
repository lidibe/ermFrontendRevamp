import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatRippleModule} from '@angular/material/core';
import {MatSortModule} from '@angular/material/sort';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {SharedModule} from 'app/shared/shared.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import {riskDataRoutes} from './risk-data.routing';
import {KriDataListComponent} from './kri-data/list/list.component';
import {KriDataComponent} from './kri-data/kri-data.component';
import {RiskAreaDataComponent} from './risk-area-data/risk-area-data.component';
import {RiskAreaDataListComponent} from './risk-area-data/list/list.component';
import {QuillModule} from 'ngx-quill';
import {SummaryDataComponent} from './summary-data/summary-data.component';
import {SummaryDataListComponent} from './summary-data/list/list.component';
import {SummaryDataDetailsComponent} from './summary-data/details/details.component';
import {MatDividerModule} from '@angular/material/divider';
import { FuseAlertComponent } from '@fuse/components/alert';

@NgModule({
    declarations: [
        KriDataComponent,
        KriDataListComponent,
        RiskAreaDataComponent,
        RiskAreaDataListComponent,
        SummaryDataComponent,
        SummaryDataListComponent,
        SummaryDataDetailsComponent,
    ],
    imports: [
        RouterModule.forChild(riskDataRoutes),
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
        QuillModule,
        MatDividerModule
    ]
})
export class RiskDataModule {
}

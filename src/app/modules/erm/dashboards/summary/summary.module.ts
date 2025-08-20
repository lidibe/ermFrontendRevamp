import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SummaryComponent } from './summary.component';
import { MatMenuModule } from '@angular/material/menu';
//import { FusionChartsModule } from 'angular-fusioncharts';
import { FuseAlertComponent } from '@fuse/components/alert';


export const routes: Route[] = [{ path: '', component: SummaryComponent }];

@NgModule({
  declarations: [SummaryComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatSidenavModule,
    MatMenuModule,
    //FusionChartsModule,
    FuseAlertComponent,
  ],
})
export class SummaryModule {}

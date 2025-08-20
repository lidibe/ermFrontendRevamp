import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { ErmHomeComponent } from './home.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ermHomeRoutes } from './home.routing';
import { FuseAlertComponent } from '@fuse/components/alert';


@NgModule({
    declarations: [
        ErmHomeComponent
    ],
    imports: [
        RouterModule.forChild(ermHomeRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        FuseAlertComponent,
        MatTableModule,
        MatPaginatorModule
    ]
})
export class ErmHomeModule {}

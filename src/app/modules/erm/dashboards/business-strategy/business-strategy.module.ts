import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {BusinessStrategyComponent} from './business-strategy.component';
import {MatMenuModule} from '@angular/material/menu';

export const routes: Route[] = [
    { path     : '', component: BusinessStrategyComponent },
];

@NgModule({
    declarations: [
        BusinessStrategyComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        SharedModule,
        MatFormFieldModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
        MatSidenavModule,
        MatMenuModule
    ]
})
export class BusinessStrategyModule
{
}

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { OrganizationsListComponent } from '../list/list.component';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { OrganizationsService } from '../organizations.service';
import { Observable } from 'rxjs';
import { TrailsOverViewComponent } from 'app/shared/components/trails-overview/trails-overview.component';
import { Trail } from 'app/shared/types/trail.types';

@Component({
    selector: 'app-organization-trails',
    templateUrl: './trails.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatDividerModule, MatIconModule, RouterLink, MatTooltipModule, TrailsOverViewComponent],
    standalone: true,
})
export class OrganizationsTrailsComponent implements OnInit, OnDestroy {
    trails$: Observable<Trail[]>;
    constructor(private _organizationsListComponent: OrganizationsListComponent, private _router: Router,
         private _route: ActivatedRoute, private _organizationsService: OrganizationsService,
         private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.openDrawer();
        this._route.params.subscribe((params) => {
            this.trails$ = this._organizationsService.getOrganizationTrails(params?.code);
            this._cdr.detectChanges();
        })
    }

    private openDrawer(): void {
        this._organizationsListComponent.matDrawer.open();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        this._router.navigate(['bosedr/organizations'])
        return this._organizationsListComponent.matDrawer.close();
    }


    ngOnDestroy(): void {}
}

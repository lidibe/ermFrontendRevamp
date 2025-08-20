import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrganizationsService } from './organizations.service';
import { Organization } from './organizations.types';

@Injectable({
    providedIn: 'root',
})
export class OrganizationsOrganizationResolver implements Resolve<any> {
    constructor(
        private _organizationService: OrganizationsService,
        private _router: Router
    ) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Organization> {
        return this._organizationService
            .getOrganizationById(route.paramMap.get('id'))
            .pipe(
                catchError((error) => {
                    console.error(error);
                    const parentUrl = state.url
                        .split('/')
                        .slice(0, -1)
                        .join('/');
                    this._router.navigateByUrl(parentUrl);
                    return throwError(error);
                })
            );
    }
}

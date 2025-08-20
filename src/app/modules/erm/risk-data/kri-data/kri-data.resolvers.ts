import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {KriDataService} from './kri-data.service';
import {KriData, KriDataPagination} from '../../models/kri-data.model';




@Injectable({
    providedIn: 'root'
})
export class KriDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _kriDataResolver: KriDataService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<KriData>
    {
        return this._kriDataResolver.getKriDataById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested product is not available
                       catchError((error) => {

                           // Log the error
                           console.error(error);

                           // Get the parent url
                           const parentUrl = state.url.split('/').slice(0, -1).join('/');

                           // Navigate to there
                           this._router.navigateByUrl(parentUrl);

                           // Throw an error
                           return throwError(error);
                       })
                   );
    }
}

@Injectable({
    providedIn: 'root'
})
export class KriDatasResolver implements Resolve<any>
{
    query = {
        sort: 'created_at',
        order: 'asc',
        page: 0,
        year: '2021',
        size: 10,
        id: '',
    };
    /**
     * Constructor
     */
    constructor(private _kriDataResolver: KriDataService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: KriDataPagination, data: KriData[] }>
    {
        return this._kriDataResolver.getKriDatas(this.query);
    }
}

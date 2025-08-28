import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {RiskAreaDataService} from './risk-area-data.service';
import {RiskAreaData, RiskAreaDataPagination} from '../../models/risk-area-data.model';




@Injectable({
    providedIn: 'root'
})
export class RiskAreaDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _riskAreaDataResolver: RiskAreaDataService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RiskAreaData>
    {
        return this._riskAreaDataResolver.getRiskAreaDataById(route.paramMap.get('id'))
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
export class RiskAreaDatasResolver implements Resolve<any>
{
    query = {
        sort: 'created_at',
        order: 'asc',
        page: 1,
        year: '2021',
        size: 10,
        id: '',
    };
    /**
     * Constructor
     */
    constructor(private _riskAreaDataResolver: RiskAreaDataService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: RiskAreaDataPagination, data: RiskAreaData[] }>
    {
        return this._riskAreaDataResolver.getRiskAreaDatas(this.query);
    }
}

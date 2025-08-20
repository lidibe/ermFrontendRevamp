import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {SummaryDataService} from './summary-data.service';
import {RiskArea, SummaryData} from './summary-data.types';

@Injectable({
    providedIn: 'root'
})
export class SummaryDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _summaryDataService: SummaryDataService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SummaryData[]>
    {
        return this._summaryDataService.getSummaryDatas();
    }
}

@Injectable({
    providedIn: 'root'
})
export class SummaryDatasSummaryDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _summaryDataService: SummaryDataService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SummaryData>
    {
        return this._summaryDataService.getSummaryDataById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested contact is not available
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
export class SummaryDatasRiskAreaResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _summaryDataService: SummaryDataService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RiskArea[]>
    {
        return this._summaryDataService.getRiskArea();
    }
}

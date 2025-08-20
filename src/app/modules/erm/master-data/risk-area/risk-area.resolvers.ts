import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {RiskAreaService} from './risk-area.service';
import {RiskArea, RiskAreaPagination} from '../../models/risk-area.model';




@Injectable({
    providedIn: 'root'
})
export class RiskAreaResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _riskAreaResolver: RiskAreaService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RiskArea>
    {
        return this._riskAreaResolver.getRiskAreaById(route.paramMap.get('id'))
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
export class RiskAreasResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _riskAreaResolver: RiskAreaService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: RiskAreaPagination, data: RiskArea[] }>
    {
        return this._riskAreaResolver.getRiskAreas();
    }
}

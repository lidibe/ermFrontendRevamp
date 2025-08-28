import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {ThresholdService} from './threshold.service';
import {Threshold, ThresholdPagination} from '../../models/threshold.model';




@Injectable({
    providedIn: 'root'
})
export class ThresholdResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _thresholdResolver: ThresholdService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Threshold>
    {
        return this._thresholdResolver.getThresholdById(route.paramMap.get('id'))
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
export class ThresholdsResolver implements Resolve<any>
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
    constructor(private _thresholdResolver: ThresholdService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: ThresholdPagination, data: Threshold[] }>
    {
        return this._thresholdResolver.getThresholds(this.query);
    }
}

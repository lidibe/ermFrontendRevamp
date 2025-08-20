import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {KriService} from './kri.service';
import {Kri, RiskArea} from './kri.types';

@Injectable({
    providedIn: 'root'
})
export class KriResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _kriService: KriService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Kri[]>
    {
        return this._kriService.getKris();
    }
}

@Injectable({
    providedIn: 'root'
})
export class KrisKriResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _kriService: KriService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Kri>
    {
        return this._kriService.getKriById(route.paramMap.get('id'))
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
export class KrisRiskAreaResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _kriService: KriService)
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
        return this._kriService.getRiskArea();
    }
}

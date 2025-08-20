import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {DirectorsService} from "./directors.service";
import {Country, Director, DirectorClass, DirectorLanguage, DirectorStatus, DirectorTitle, DirectorType} from "./directors.types";

@Injectable({
    providedIn: 'root'
})
export class DirectorsDirectorsResolver implements Resolve<any> {
    constructor(
        private _directorsService: DirectorsService,
        private _router: Router
    ) { }


    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Director[]> {
        return this._directorsService.getAllNonDeletedDirectors();
    }
}

@Injectable({
    providedIn: 'root'
})
export class DirectorsDirectorResolver implements Resolve<any> {
    constructor(
        private _directorsService: DirectorsService,
        private _router: Router
    ) { }


    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Director> {
        return this._directorsService.getDirectorById(route.paramMap.get('id'))
            .pipe(
                catchError((error) => {

                    console.error(error);

                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    this._router.navigateByUrl(parentUrl);

                    return throwError(error);
                })
            );
    }
}

@Injectable({
    providedIn: 'root'
})
export class DirectorsClassesResolver implements Resolve<any> {
    constructor(
        private _directorsService: DirectorsService,
    ) { }


    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<DirectorClass[]> {
        return this._directorsService.getDirectorClasses();
    }
}

@Injectable({
    providedIn: 'root'
})
export class DirectorsCountriesResolver implements Resolve<any> {
    constructor(
        private _directorsService: DirectorsService
    ) { }


    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Country[]> {
        return this._directorsService.getCountries();
    }
}

@Injectable({
    providedIn: 'root'
})
export class DirectorsLanguagesResolver implements Resolve<any> {
    constructor(
        private _directorsService: DirectorsService,
    ) { }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<DirectorLanguage[]> {
        return this._directorsService.getDirectorLanguages();
    }
}

@Injectable({
    providedIn: 'root'
})
export class DirectorsTitlesResolver implements Resolve<DirectorTitle[]> {
    constructor(
        private _directorsService: DirectorsService,
    ) { }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<DirectorTitle[]> {
        return this._directorsService.getDirectorTitles();
    }
}

@Injectable({
    providedIn: 'root'
})
export class DirectorsTypesResolver implements Resolve<DirectorType[]> {
    constructor(
        private _directorsService: DirectorsService,
    ) { }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<DirectorType[]> {
        return this._directorsService.getDirectorTypes();
    }
}

@Injectable({
    providedIn: 'root'
})
export class DirectorsStatusResolver implements Resolve<DirectorStatus[]> {
    constructor(
        private _directorsService: DirectorsService,
    ) { }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<DirectorStatus[]> {
        return this._directorsService.getDirectorStatus();
    }
}
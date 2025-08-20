import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommitteesService } from './committees.service';
import { Committee } from './committees.types';
import {DirectorsService} from "../directors/directors.service";
import {Director} from "../directors/directors.types";

@Injectable({
  providedIn: 'root'
})
export class CommitteesMembersResolver implements Resolve<any> {
  constructor(
    private _directorsService: DirectorsService,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Director[]> {
    return this._directorsService.getAllNonDeletedDirectors();
  }
}

@Injectable({
  providedIn: 'root'
})
export class CommitteesRolesResolver implements Resolve<any> {
  constructor(
    private _directorsService: DirectorsService,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
    return this._directorsService.getDirectorRoles();
  }
}

@Injectable({
  providedIn: 'root'
})
export class CommitteesCommitteeResolver implements Resolve<any> {
  constructor(
    private _committeeService: CommitteesService,
    private _router: Router,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Committee> {
    return this._committeeService.getCommitteeById(route.paramMap.get('id'))
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

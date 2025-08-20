import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CommitteesDetailsComponent } from './details/details.component';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateCommitteesDetails implements CanDeactivate<CommitteesDetailsComponent>{
  canDeactivate(
    component: CommitteesDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) nextRoute = nextRoute.firstChild;
    if (!nextState.url.includes('/committees') || nextRoute.paramMap.get('id')) return true;
    return component.closeDrawer().then(() => true);
  }
}

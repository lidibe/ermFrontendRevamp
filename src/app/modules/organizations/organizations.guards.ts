import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { OrganizationsDetailsComponent } from './details/details.component';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateOrganizationsDetails implements CanDeactivate<OrganizationsDetailsComponent>{
  canDeactivate(
    component: OrganizationsDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) nextRoute = nextRoute.firstChild;
    if (!nextState.url.includes('/organizations') || nextRoute.paramMap.get('id')) return true;
    return component.closeDrawer().then(() => true);
  }
}

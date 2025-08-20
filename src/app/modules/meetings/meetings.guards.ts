import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {MeetingsDetailsComponent} from "./details/details.component";

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateMeetingsDetails implements CanDeactivate<MeetingsDetailsComponent>
{
    canDeactivate(
        component: MeetingsDetailsComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        let nextRoute: ActivatedRouteSnapshot = nextState.root;
        while (nextRoute.firstChild) {
            nextRoute = nextRoute.firstChild;
        }

        if (!nextState.url.includes('/meetings')) {
            return true;
        }

        if (nextRoute.paramMap.get('id')) {
            return true;
        }
        else {
            return component.closeDrawer().then(() => {
                return true;
            });
        }
    }
}

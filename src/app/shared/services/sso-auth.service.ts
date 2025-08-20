import moment from 'moment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {appConfig} from '../../core/config/app.config';

@Injectable({
    providedIn: 'root'
})
export class SSOAuthService {

    private authUrl;
    public currentUser: Observable<any>;

    constructor(private http: HttpClient) {
        this.authUrl = appConfig.endpoints.auth;
    }

    private setSession(authResult: any): void {
        const expiresAt = authResult.data.expiresIn;
        localStorage.setItem('permissions', JSON.stringify(authResult.data.profile));
        localStorage.setItem('id_token', authResult.data.idToken);
        localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
    }

    login(username: string, password: string): any {
        const data = { email: username, password};

        return this.http.post<any>(`/api/v1/auth/login`, data)
            .pipe(map(result => {
                    if (result && result.data && result.data.token) {
                        // store user details and jwt token in local storage to keep user logged in between page refreshes
                        this.setSession(result);
                        localStorage.setItem('currentUser', JSON.stringify(result.data));
                    }
                    return result;
                }),
            );
    }

    oauth(data: any): any {
      const url = `/ms/api/v1/auth/oauth/okta-v3`;
      return this.http
        .post(url, data);
    }

    public isLoggedIn(): any {
        return moment().isBefore(this.getExpiration());
    }

    isLoggedOut(): any {
        return !this.isLoggedIn();
    }

    getUserPermissions(): any {
        const permissions =  localStorage.getItem('permissions');
        return JSON.parse(permissions);
    }

    getCurrentUser(): any {
        return localStorage.getItem('currentUser');
    }

    getExpiration(): any {
        const expiration = localStorage.getItem('expires_at');
        const expiresAt = JSON.parse(expiration);
        return moment(expiresAt);
    }

    logout(): any {
        // remove user from local storage to log user out
        return this.http.get<any>(`/v1/auth/logout`)
            .pipe(map(result => {
                localStorage.removeItem('id_token');
                localStorage.removeItem('expires_at');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('permissions');
                return result;
            }));
    }
}

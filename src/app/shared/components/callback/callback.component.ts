import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { OktaAuth } from '@okta/okta-auth-js';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import {appConfig} from '../../../core/config/app.config';
import {SSOAuthService} from '../../services/sso-auth.service';
import {UserService} from '../../../core/user/user.service';
import {User} from '../../../core/user/user.types';

@Component({
  template: '',
  standalone: true
})
export class CallbackComponent implements OnInit {

  oktaAuth = new OktaAuth({
    clientId: appConfig.oidc.clientId,
    issuer: appConfig.oidc.issuer,
    redirectUri: appConfig.frontendUrl + appConfig.oidc.callback,
    tokenManager: {
      storage: 'sessionStorage',
    },
  });

    @Output() signInCompleted: EventEmitter<any> = new EventEmitter();
     isAuthenticated: boolean = false;

    constructor(
      private authService: SSOAuthService,
      private _router: Router,
      private toastr: ToastrService,
      private _userService: UserService,
      ) {}

    ngOnInit(): void {
        // console.log('Pass by here');
        this.handleAuthentication();
    }

  /**
   * Setter & getter for access token
   */
  set accessToken(token: string)
  {
    localStorage.setItem('access_token', token);
  }

  get accessToken(): string
  {
    return localStorage.getItem('access_token') ?? '';
  }

  /**
   * Setter & getter for access token expiry
   */
  set accessTokenExpiry(token: string)
  {
    localStorage.setItem('access_token_exp', token);
  }

  get accessTokenExpiry(): string
  {
    return localStorage.getItem('access_token_exp') ?? '';
  }

  /**
   * Setter & getter for user details
   */
  set userDetails(token: string)
  {
    localStorage.setItem('user', token);
  }

  get userDetails(): string
  {
    return localStorage.getItem('user') ?? '';
  }

  async handleAuthentication(): Promise<any> {

    try {
      const tokens = await this.oktaAuth.token.parseFromUrl();
      const oktaData = { token: tokens };
        const redirectURL = localStorage.getItem('lastRoute') || '/bosedr/directors';

      return this.authService.oauth(oktaData)
        .pipe(catchError(async (err) => this.toastr.error(err)))
        .subscribe((data?: { token: string; exp: number, iat: number, user: any }) => {
            console.log('data', data);
            if (data && data.token) {
            this.accessToken = data.token;
            this.accessTokenExpiry = data?.exp?.toString();
            this.isAuthenticated = true;
            const _user = {} as User;
            _user.id = data.user._id;
            _user.email = data.user.email;
            _user.name = `${data.user.firstname} ${data.user.lastname}`;
            _user.status = 'online';
            this.userDetails = JSON.stringify(_user);
            this._userService.user = _user;
            this._router.navigate([redirectURL]);
          }
        });
    } catch (err) {
      console.log('err', err);
      localStorage.removeItem('currentUser');
      this._router.navigate(['/login']);
    }
  }
}

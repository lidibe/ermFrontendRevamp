import { Injectable, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AccessToken, IDToken, OktaAuth, Token } from '@okta/okta-auth-js';
// import { SettingsService, StartupService, TokenService } from '@core';
import {appConfig} from '../../core/config/app.config';
import {SSOAuthService} from './sso-auth.service';


@Injectable({
   providedIn: 'root'
})
export class OktaAppService {

  private user = new Subject<any>();

  oktaAuth = new OktaAuth({
    clientId: appConfig.oidc.clientId,
    issuer: appConfig.oidc.issuer,
    redirectUri: appConfig.frontendUrl + appConfig.oidc.callback,
    tokenManager: {
      storage: 'sessionStorage',
    },
  });

  @Output() signInCompleted: EventEmitter<any> = new EventEmitter();
  @Input() authenticated = false;

  userStorage: any;

  constructor(private router: Router,
              private authService: SSOAuthService,
              // private settings: SettingsService,
              // private token: TokenService,
              // private startup: StartupService,
              ) {
  }

  isAuthenticated(): any {
    this.userStorage = localStorage.getItem('currentUser');
    return !!this.userStorage;
  }

  login(): void {
    // Launches the login redirect.
      const redirectUri = `${window.location.origin}/implicit/callback`;
      const oktaAuth = new OktaAuth({
          clientId: appConfig.oidc.clientId,
          issuer: appConfig.oidc.issuer,
          redirectUri,
          tokenManager: {
              storage: 'sessionStorage',
          },
      });
    try {
      oktaAuth.token.getWithRedirect({
        responseType: ['id_token', 'token'],
        scopes: ['openid', 'email', 'profile'],
      });
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Returns the current idToken in the tokenManager.
   */
  async getIdToken(): Promise<AccessToken | IDToken> {
    try {
        const redirectUri = `${window.location.origin}/implicit/callback`;
        const oktaAuth = new OktaAuth({
            clientId: appConfig.oidc.clientId,
            issuer: appConfig.oidc.issuer,
            redirectUri,
            tokenManager: {
                storage: 'sessionStorage',
            },
        });
      // @ts-ignore
      return await oktaAuth.tokenManager.get('idToken');

    } catch (err) {
      // The user no longer has an existing SSO session in the browser.
      // (OIDC error `login_required`)
      // Ask the user to authenticate again.
      return undefined;
    }
  }

  async handleAuthentication(): Promise<void> {

    try {

        const redirectUri = `${window.location.origin}/implicit/callback`;
        const oktaAuth = new OktaAuth({
            clientId: appConfig.oidc.clientId,
            issuer: appConfig.oidc.issuer,
            redirectUri,
            tokenManager: {
                storage: 'sessionStorage',
            },
        });
      const tokens = await oktaAuth.token.parseFromUrl();

      const data = { token: tokens };

      this.authService.oauth(data).subscribe((result: any) => {
        this.authenticated = true;
        this.signInCompleted.emit(this.authenticated);
        this.user = result.data;

        if (result.data) {
          const user = {
            id: result.data.user.id,
            name: `${result.data.user.firstname} ${result.data.user.lastname}`,
            email: result.data.user.email,
            avatar: '/assets/images/avatar.jpg', // do we need avatar?
          };
        }
      });
    } catch (err) {
      console.log('err', err);
      localStorage.removeItem('currentUser');
      this.router.navigate(['/login']);
    }
  }

  async logout(): Promise<void> {
      const redirectUri = `${window.location.origin}/implicit/callback`;
      const oktaAuth = new OktaAuth({
          clientId: appConfig.oidc.clientId,
          issuer: appConfig.oidc.issuer,
          redirectUri,
          tokenManager: {
              storage: 'sessionStorage',
          },
      });
    oktaAuth.tokenManager.clear();
    await this.oktaAuth.signOut();
    this.authenticated = false;
    this.signInCompleted.emit(this.authenticated);
    this.router.navigateByUrl('/login');
  }
}

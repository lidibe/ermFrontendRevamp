import { Layout } from "app/layout/layout.types";


// Types
export type Scheme = 'auto' | 'dark' | 'light';
export type Theme = 'default' | string;

/**
 * AppConfig interface. Update this interface to strictly type your config
 * object.
 */
export interface AppConfig
{
    layout: Layout;
    scheme: Scheme;
    theme: Theme;
    routes: any;
    endpoints: any;
    votesLimit: number;
    topHeroesLimit: number;
    snackBarDuration: number;
    repositoryURL: string;
    oidc: any;
    frontendUrl: string;
}

/**
 * Default configuration for the entire application. This object is used by
 * TreoConfigService to set the default configuration.
 *
 * If you need to store global configuration for your app, you can use this
 * object to set the defaults. To access, update and reset the config, use
 * TreoConfigService and its methods.
 */
export const appConfig: AppConfig = {
    layout: 'classy',
    scheme: 'light',
    theme : 'default',
    routes: {
        contacts: 'contacts',
        verification: 'verification',
        login: 'login',
        callback: 'implicit/callback',
        protected: 'protected',
        error404: '404',
    },
    endpoints: {
        contacts: '/v1/contact',
        countries: '/v1/country',
        auth: '/v1/auth',
    },
    oidc: {
        clientId: `0oara9cdumHG2TqiW1t7`,
        issuer: `https://afreximbank.okta.com/oauth2/default`,
        callback: '/implicit/callback',
        redirectUri: 'http://localhost:4200/implicit/callback',
        scopes: ['openid', 'profile', 'email'],
    },
    frontendUrl: 'http://localhost:4200',
    /*  oidc: {
        clientId: `0oara9cdumHG2TqiW1t7`,
        issuer: `https://afreximbank.okta.com/oauth2/default`,
        callback: '/implicit/callback',
        redirectUri: 'https://bose-app.uat.afreximbank.net/implicit/callback',
        scopes: ['openid', 'profile', 'email'],
    },
    frontendUrl: 'https://bose-app.uat.afreximbank.net',
    */
    votesLimit: 3,
    topHeroesLimit: 4,
    snackBarDuration: 3000,
    repositoryURL: 'https://github.com/lidibe/.git',
};

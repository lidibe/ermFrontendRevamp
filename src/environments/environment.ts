export const environment = {
    production: false,
    auth0: {
        domain: 'id.uat.afreximbank.net',
        clientId: 'GPp7QPEPNfEhC4RaiCcQZIcH2IgZCnKZ',
        authorizationParams: {
            connection: 'EXCO-Okta-Dev',
            audience: 'https://exco-automation.afxm.local/',
            redirect_uri: window.location.origin + '/callback',
        },
        httpInterceptor: {
            allowedList: ['/ms/api/*'],
        },
        rolesKey: 'https://id.uat.afreximbank.net/roles',
        errorPath: '/sign-in',
    },
};

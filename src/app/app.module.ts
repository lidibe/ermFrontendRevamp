import { NgModule, APP_INITIALIZER, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptors} from '@angular/common/http';
import { RouterModule, PreloadAllModules } from '@angular/router';

import { AppComponent } from 'app/app.component';   // now a classic (non-standalone) component
import { CoreModule } from 'app/core/core.module';
import { SharedModule } from 'app/shared/shared.module';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';

import { provideTransloco, TranslocoService } from '@ngneat/transloco';
import { TranslocoHttpLoader } from 'app/core/transloco/transloco.http-loader';

import { firstValueFrom } from 'rxjs';
import { successInterceptor } from 'app/shared/interceptors/alert.interceptor';

import { provideIcons } from 'app/core/icons/icons.provider';
import { provideFuse } from '@fuse';
import { mockApiServices } from 'app/mock-api';

import { appRoutes } from './app.routes';
import { QuillModule } from "ngx-quill";
import { AngularSvgIconModule } from 'angular-svg-icon';
import { PublicKriComponent } from './modules/public/kri/kri.component';
import { KriAddDialogComponent } from './shared/dialogs/kri-add/kri-add.dialog.component';
import { KriDataAddDialogComponent } from './shared/dialogs/kri-data-add/kri-data-add.dialog.component';
import { KriThresholdDialogComponent } from './shared/dialogs/kri-threshold/kri-threshold.dialog.component';
import { RiskAreaDataAddDialogComponent } from './shared/dialogs/risk-area-data-add/risk-area-data-add.dialog.component';
import { SummaryDataAddDialogComponent } from './shared/dialogs/summary-data-add/summary-data-add.dialog.component';

import { AuthModule, AuthHttpInterceptor } from '@auth0/auth0-angular';
import { environment } from 'environments/environment';
import FusionCharts from "fusioncharts";
import {
  CURRENCY_MASK_CONFIG,
  CurrencyMaskConfig,
  CurrencyMaskModule,
} from "ng2-currency-mask";
import { KriRiskTypesDialogComponent } from './shared/dialogs/kri-risk-types/kri-risk-types.dialog.component';

FusionCharts.options["license"]({
  key: "CyA8qlbE4D2A22A3A2D3B1D2D2C4E2H1A8apzA2E5D-8H-8woxB4B1sevE4H1B9D4C3D2D2C4B1E1H4B1C3A3B1B3axxH2B7B2xD2C2E1mlF-7C11C2C7egvD4F3H3eD-16C-13F4E2D3F1G1I4B2C8E3E2B2rttB1B11GD1xG-10sG4A19A32bqD8ZB5G4ooxA9C5A5E7E6C5G4B1B3A9C3A6B4D2f==",
  creditLabel: false,
});

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: "right",
  allowNegative: true,
  decimal: ",",
  precision: 2,
  prefix: "$ ",
  suffix: "",
  thousands: ".",
};

@NgModule({
  declarations: [
    AppComponent,
    KriDataAddDialogComponent,
    RiskAreaDataAddDialogComponent,
    KriAddDialogComponent,
    KriThresholdDialogComponent,
    SummaryDataAddDialogComponent,
    PublicKriComponent,
    KriRiskTypesDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    }),
    CoreModule.forRoot(),
    SharedModule,
    QuillModule.forRoot(),
    AngularSvgIconModule.forRoot(),
      AuthModule.forRoot({
          domain: environment.auth0.domain,
          clientId: environment.auth0.clientId,
          authorizationParams: {
              connection: environment.auth0.authorizationParams.connection,
              audience: environment.auth0.authorizationParams.audience,
              redirect_uri:
              environment.auth0.authorizationParams.redirect_uri,
          },
          httpInterceptor: {
              allowedList: environment.auth0.httpInterceptor.allowedList,
          },
          errorPath: environment.auth0.errorPath,
      }),
      CurrencyMaskModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    provideAnimations(),
    provideToastr(),
    provideHttpClient(withInterceptors([successInterceptor])),

    provideTransloco({
      config: {
        availableLangs: [
          { id: 'en', label: 'English' },
          { id: 'tr', label: 'Turkish' },
        ],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: true,
      },
      loader: TranslocoHttpLoader,
    }),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const transloco = inject(TranslocoService);
        const def = transloco.getDefaultLang();
        transloco.setActiveLang(def);
        return () => firstValueFrom(transloco.load(def));
      },
    },

      {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthHttpInterceptor,
          multi: true,
      },

    { provide: DateAdapter, useClass: LuxonDateAdapter },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: { dateInput: 'D' },
        display: {
          dateInput: 'DDD',
          monthYearLabel: 'LLL yyyy',
          dateA11yLabel: 'DD',
          monthYearA11yLabel: 'LLLL yyyy',
        },
      },
    },
    provideIcons(),
    provideFuse({
      mockApi: { delay: 0, services: mockApiServices },
      fuse: {
        layout: 'classy',
        scheme: 'light',
        screens: { sm: '600px', md: '960px', lg: '1280px', xl: '1440px' },
        theme: 'theme-default',
        themes: [
          { id: 'theme-default', name: 'Default' },
          { id: 'theme-brand', name: 'Brand' },
          { id: 'theme-teal', name: 'Teal' },
          { id: 'theme-rose', name: 'Rose' },
          { id: 'theme-purple', name: 'Purple' },
          { id: 'theme-amber', name: 'Amber' },
        ],
      },
    }),
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ],
})
export class AppModule {}

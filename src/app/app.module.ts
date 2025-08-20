import { NgModule, APP_INITIALIZER, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
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

import { provideAuth } from 'app/core/auth/auth.provider';
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

@NgModule({
  declarations: [
    AppComponent,
    KriDataAddDialogComponent,
    RiskAreaDataAddDialogComponent,
    KriAddDialogComponent,
    KriThresholdDialogComponent,
    SummaryDataAddDialogComponent,
    PublicKriComponent,
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
    AngularSvgIconModule.forRoot()
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

    provideAuth(),
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
  ],
})
export class AppModule {}

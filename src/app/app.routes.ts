import {Route} from '@angular/router';
import {initialDataResolver} from 'app/app.resolvers';
import {AuthGuard} from '@auth0/auth0-angular';
import {NoAuthGuard} from 'app/core/auth/guards/noAuth.guard';
import {LayoutComponent} from 'app/layout/layout.component';
import {CallbackComponent} from "./shared/components/callback/callback.component";

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/bosedr/directors'
    {path: '', pathMatch : 'full', redirectTo: 'bosedr/directors'},

    // Redirect signed-in user to the '/dashboards/project'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'dashboards/project'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'callback', component: CallbackComponent, data: {title: 'Callback', titleI18n: 'callback'}},
            // {path: 'implicit/callback', component: CallbackComponent, data: { title: 'Callback', titleI18n: 'callback' } },
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes')}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')}
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
                {
        path: 'erm',
        children: [
          {
            path: 'home',
            loadChildren: () =>
              import('app/modules/erm/home/home.module').then(
                (m) => m.ErmHomeModule
              ),
          },
          {
            path: 'dashboards',
            children: [
              {
                path: 'summary',
                loadChildren: () =>
                  import(
                    'app/modules/erm/dashboards/summary/summary.module'
                  ).then((m) => m.SummaryModule),
              },
              {
                path: 'overall',
                loadChildren: () =>
                  import(
                    'app/modules/erm/dashboards/overall/overall.module'
                  ).then((m) => m.OverallModule),
              },
              {
                path: 'business-strategy',
                loadChildren: () =>
                  import(
                    'app/modules/erm/dashboards/business-strategy/business-strategy.module'
                  ).then((m) => m.BusinessStrategyModule),
              },
              {
                path: 'liquidity',
                loadChildren: () =>
                  import(
                    'app/modules/erm/dashboards/liquidity/liquidity.module'
                  ).then((m) => m.LiquidityModule),
              },
              {
                path: 'credit',
                loadChildren: () =>
                  import(
                    'app/modules/erm/dashboards/credit/credit.module'
                  ).then((m) => m.CreditModule),
              },
              {
                path: 'market',
                loadChildren: () =>
                  import(
                    'app/modules/erm/dashboards/market/market.module'
                  ).then((m) => m.MarketModule),
              },
              {
                path: 'compliance',
                loadChildren: () =>
                  import(
                    'app/modules/erm/dashboards/compliance/compliance.module'
                  ).then((m) => m.ComplianceModule),
              },
              {
                path: 'operational',
                loadChildren: () =>
                  import(
                    'app/modules/erm/dashboards/operational/operational.module'
                  ).then((m) => m.OperationalModule),
              },
              {
                path: 'reputational',
                loadChildren: () =>
                  import(
                    'app/modules/erm/dashboards/reputational/reputational.module'
                  ).then((m) => m.ReputationalModule),
              },
              {
                path: 'mandate',
                loadChildren: () =>
                  import(
                    'app/modules/erm/dashboards/mandate/mandate.module'
                  ).then((m) => m.MandateModule),
              },
            ],
          },
          {
            path: 'master-data',
            loadChildren: () =>
              import('app/modules/erm/master-data/master-data.module').then(
                (m) => m.MasterDataModule
              ),
          },
          {
            path: 'risk-data',
            loadChildren: () =>
              import('app/modules/erm/risk-data/risk-data.module').then(
                (m) => m.RiskDataModule
              ),
          },
          {
            path: 'user-groups',
            children: [
              {
                path: '',
                loadChildren: () =>
                  import(
                    'app/modules/admin/user-groups/user-groups.module'
                  ).then((m) => m.UserGroupsModule),
              },
            ],
          },
                  ],
                },

            // Dashboards
            {path: 'dashboards', children: [
                {path: 'project', loadChildren: () => import('app/modules/admin/dashboards/project/project.routes')},
                {path: 'analytics', loadChildren: () => import('app/modules/admin/dashboards/analytics/analytics.routes')},
                {path: 'finance', loadChildren: () => import('app/modules/admin/dashboards/finance/finance.routes')},
                {path: 'crypto', loadChildren: () => import('app/modules/admin/dashboards/crypto/crypto.routes')},
            ]},

            // Apps
            {path: 'apps', children: [
                {path: 'academy', loadChildren: () => import('app/modules/admin/apps/academy/academy.routes')},
                {path: 'chat', loadChildren: () => import('app/modules/admin/apps/chat/chat.routes')},
                {path: 'contacts', loadChildren: () => import('app/modules/admin/apps/contacts/contacts.routes')},
                {path: 'ecommerce', loadChildren: () => import('app/modules/admin/apps/ecommerce/ecommerce.routes')},
                {path: 'file-manager', loadChildren: () => import('app/modules/admin/apps/file-manager/file-manager.routes')},
                {path: 'help-center', loadChildren: () => import('app/modules/admin/apps/help-center/help-center.routes')},
                {path: 'mailbox', loadChildren: () => import('app/modules/admin/apps/mailbox/mailbox.routes')},
                {path: 'notes', loadChildren: () => import('app/modules/admin/apps/notes/notes.routes')},
                {path: 'scrumboard', loadChildren: () => import('app/modules/admin/apps/scrumboard/scrumboard.routes')},
                {path: 'tasks', loadChildren: () => import('app/modules/admin/apps/tasks/tasks.routes')},
            ]},

            // Pages
            {path: 'pages', children: [

                // Activities
                {path: 'activities', loadChildren: () => import('app/modules/admin/pages/activities/activities.routes')},

                // Authentication
                {path: 'authentication', loadChildren: () => import('app/modules/admin/pages/authentication/authentication.routes')},

                // Coming Soon
                {path: 'coming-soon', loadChildren: () => import('app/modules/admin/pages/coming-soon/coming-soon.routes')},

                // Error
                {path: 'error', children: [
                    {path: '404', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.routes')},
                    {path: '500', loadChildren: () => import('app/modules/admin/pages/error/error-500/error-500.routes')}
                ]},

                // Invoice
                {path: 'invoice', children: [
                    {path: 'printable', children: [
                        {path: 'compact', loadChildren: () => import('app/modules/admin/pages/invoice/printable/compact/compact.routes')},
                        {path: 'modern', loadChildren: () => import('app/modules/admin/pages/invoice/printable/modern/modern.routes')}
                    ]}
                ]},

                // Maintenance
                {path: 'maintenance', loadChildren: () => import('app/modules/admin/pages/maintenance/maintenance.routes')},

                // Pricing
                {path: 'pricing', children: [
                    {path: 'modern', loadChildren: () => import('app/modules/admin/pages/pricing/modern/modern.routes')},
                    {path: 'simple', loadChildren: () => import('app/modules/admin/pages/pricing/simple/simple.routes')},
                    {path: 'single', loadChildren: () => import('app/modules/admin/pages/pricing/single/single.routes')},
                    {path: 'table', loadChildren: () => import('app/modules/admin/pages/pricing/table/table.routes')}
                ]},

                // Profile
                {path: 'profile', loadChildren: () => import('app/modules/admin/pages/profile/profile.routes')},

                // Settings
                {path: 'settings', loadChildren: () => import('app/modules/admin/pages/settings/settings.routes')},
            ]},

            // User Interface
            {path: 'ui', children: [

                // Material Components
                {path: 'material-components', loadChildren: () => import('app/modules/admin/ui/material-components/material-components.routes')},

                // Fuse Components
                {path: 'fuse-components', loadChildren: () => import('app/modules/admin/ui/fuse-components/fuse-components.routes')},

                // Other Components
                {path: 'other-components', loadChildren: () => import('app/modules/admin/ui/other-components/other-components.routes')},

                // TailwindCSS
                {path: 'tailwindcss', loadChildren: () => import('app/modules/admin/ui/tailwindcss/tailwindcss.routes')},

                // Advanced Search
                {path: 'advanced-search', loadChildren: () => import('app/modules/admin/ui/advanced-search/advanced-search.routes')},

                // Animations
                {path: 'animations', loadChildren: () => import('app/modules/admin/ui/animations/animations.routes')},

                 // Cards
                {path: 'cards', loadChildren: () => import('app/modules/admin/ui/cards/cards.routes')},

                // Colors
                {path: 'colors', loadChildren: () => import('app/modules/admin/ui/colors/colors.routes')},

                // Confirmation Dialog
                {path: 'confirmation-dialog', loadChildren: () => import('app/modules/admin/ui/confirmation-dialog/confirmation-dialog.routes')},

                // Datatable
                {path: 'datatable', loadChildren: () => import('app/modules/admin/ui/datatable/datatable.routes')},

                // Forms
                {path: 'forms', loadChildren: () => import('app/modules/admin/ui/forms/forms.routes')},

                // Icons
                {path: 'icons', loadChildren: () => import('app/modules/admin/ui/icons/icons.routes')},

                // Page Layouts
                {path: 'page-layouts', loadChildren: () => import('app/modules/admin/ui/page-layouts/page-layouts.routes')},

                // Typography
                {path: 'typography', loadChildren: () => import('app/modules/admin/ui/typography/typography.routes')}
            ]},

            // Documentation
            {path: 'docs', children: [

                // Changelog
                {path: 'changelog', loadChildren: () => import('app/modules/admin/docs/changelog/changelog.routes')},

                // Guides
                {path: 'guides', loadChildren: () => import('app/modules/admin/docs/guides/guides.routes')}
            ]},

            // 404 & Catch all
            {path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.routes')},
            {path: '**', redirectTo: '404-not-found'}
        ]
    }
];

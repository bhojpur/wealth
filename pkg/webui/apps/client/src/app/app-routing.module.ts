// Copyright (c) 2018 Bhojpur Consulting Private Limited, India. All rights reserved.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ModulePreloadService } from './core/module-preload.service';

const routes: Routes = [
  {
    path: 'about',
    loadChildren: () =>
      import('./pages/about/about-page.module').then((m) => m.AboutPageModule)
  },
  {
    path: 'about/changelog',
    loadChildren: () =>
      import('./pages/about/changelog/changelog-page.module').then(
        (m) => m.ChangelogPageModule
      )
  },
  {
    path: 'about/privacy-policy',
    loadChildren: () =>
      import('./pages/about/privacy-policy/privacy-policy-page.module').then(
        (m) => m.PrivacyPolicyPageModule
      )
  },
  {
    path: 'account',
    loadChildren: () =>
      import('./pages/account/account-page.module').then(
        (m) => m.AccountPageModule
      )
  },
  {
    path: 'accounts',
    loadChildren: () =>
      import('./pages/accounts/accounts-page.module').then(
        (m) => m.AccountsPageModule
      )
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./pages/admin/admin-page.module').then((m) => m.AdminPageModule)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth-page.module').then((m) => m.AuthPageModule)
  },
  {
    path: 'blog',
    loadChildren: () =>
      import('./pages/blog/blog-page.module').then((m) => m.BlogPageModule)
  },
  {
    path: 'de/blog/2018/03/hallo-bhojpur',
    loadChildren: () =>
      import(
        './pages/blog/2018/03/hallo-bhojpur/hallo-bhojpur-page.module'
      ).then((m) => m.HalloBhojpurPageModule)
  },
  {
    path: 'demo',
    loadChildren: () =>
      import('./pages/demo/demo-page.module').then((m) => m.DemoPageModule)
  },
  {
    path: 'en/blog/2018/03/hello-bhojpur',
    loadChildren: () =>
      import(
        './pages/blog/2018/03/hello-bhojpur/hello-bhojpur-page.module'
      ).then((m) => m.HelloBhojpurPageModule)
  },
  {
    path: 'en/blog/2022/01/bhojpur-first-months-in-open-source',
    loadChildren: () =>
      import(
        './pages/blog/2022/01/first-months-in-open-source/first-months-in-open-source-page.module'
      ).then((m) => m.FirstMonthsInOpenSourcePageModule)
  },
  {
    path: 'features',
    loadChildren: () =>
      import('./pages/features/features-page.module').then(
        (m) => m.FeaturesPageModule
      )
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./pages/home/home-page.module').then((m) => m.HomePageModule)
  },
  {
    path: 'p',
    loadChildren: () =>
      import('./pages/public/public-page.module').then(
        (m) => m.PublicPageModule
      )
  },
  {
    path: 'portfolio',
    loadChildren: () =>
      import('./pages/portfolio/portfolio-page.module').then(
        (m) => m.PortfolioPageModule
      )
  },
  {
    path: 'portfolio/activities',
    loadChildren: () =>
      import('./pages/portfolio/transactions/transactions-page.module').then(
        (m) => m.TransactionsPageModule
      )
  },
  {
    path: 'portfolio/allocations',
    loadChildren: () =>
      import('./pages/portfolio/allocations/allocations-page.module').then(
        (m) => m.AllocationsPageModule
      )
  },
  {
    path: 'portfolio/analysis',
    loadChildren: () =>
      import('./pages/portfolio/analysis/analysis-page.module').then(
        (m) => m.AnalysisPageModule
      )
  },
  {
    path: 'portfolio/fire',
    loadChildren: () =>
      import('./pages/portfolio/fire/fire-page.module').then(
        (m) => m.FirePageModule
      )
  },
  {
    path: 'portfolio/holdings',
    loadChildren: () =>
      import('./pages/portfolio/holdings/holdings-page.module').then(
        (m) => m.HoldingsPageModule
      )
  },
  {
    path: 'portfolio/report',
    loadChildren: () =>
      import('./pages/portfolio/report/report-page.module').then(
        (m) => m.ReportPageModule
      )
  },
  {
    path: 'pricing',
    loadChildren: () =>
      import('./pages/pricing/pricing-page.module').then(
        (m) => m.PricingPageModule
      )
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./pages/register/register-page.module').then(
        (m) => m.RegisterPageModule
      )
  },
  {
    path: 'resources',
    loadChildren: () =>
      import('./pages/resources/resources-page.module').then(
        (m) => m.ResourcesPageModule
      )
  },
  {
    path: 'start',
    loadChildren: () =>
      import('./pages/landing/landing-page.module').then(
        (m) => m.LandingPageModule
      )
  },
  {
    path: 'webauthn',
    loadChildren: () =>
      import('./pages/webauthn/webauthn-page.module').then(
        (m) => m.WebauthnPageModule
      )
  },
  {
    path: 'zen',
    loadChildren: () =>
      import('./pages/zen/zen-page.module').then((m) => m.ZenPageModule)
  },
  {
    // wildcard, if requested url doesn't match any paths for routes defined
    // earlier
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      // Preload all lazy loaded modules with the attribute preload === true
      {
        anchorScrolling: 'enabled',
        preloadingStrategy: ModulePreloadService,
        // enableTracing: true // <-- debugging purposes only
        relativeLinkResolution: 'legacy'
      }
    )
  ],
  providers: [ModulePreloadService],
  exports: [RouterModule]
})
export class AppRoutingModule {}

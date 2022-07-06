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

import { Platform } from '@angular/cdk/platform';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule
} from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialCssVarsModule } from 'angular-material-css-vars';
import { MarkdownModule } from 'ngx-markdown';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgxStripeModule, STRIPE_PUBLISHABLE_KEY } from 'ngx-stripe';

import { environment } from '../environments/environment';
import { CustomDateAdapter } from './adapter/custom-date-adapter';
import { DateFormats } from './adapter/date-formats';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BhojpurHeaderModule } from './components/header/header.module';
import { authInterceptorProviders } from './core/auth.interceptor';
import { httpResponseInterceptorProviders } from './core/http-response.interceptor';
import { LanguageService } from './core/language.service';

export function NgxStripeFactory(): string {
  return environment.stripePublicKey;
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    BhojpurHeaderModule,
    HttpClientModule,
    MarkdownModule.forRoot(),
    MatAutocompleteModule,
    MatChipsModule,
    MaterialCssVarsModule.forRoot({
      darkThemeClass: 'is-dark-theme',
      isAutoContrast: true,
      lightThemeClass: 'is-light-theme'
    }),
    MatNativeDateModule,
    MatSnackBarModule,
    NgxSkeletonLoaderModule,
    NgxStripeModule.forRoot(environment.stripePublicKey)
  ],
  providers: [
    authInterceptorProviders,
    httpResponseInterceptorProviders,
    LanguageService,
    {
      provide: DateAdapter,
      useClass: CustomDateAdapter,
      deps: [LanguageService, MAT_DATE_LOCALE, Platform]
    },
    { provide: MAT_DATE_FORMATS, useValue: DateFormats },
    {
      provide: STRIPE_PUBLISHABLE_KEY,
      useFactory: NgxStripeFactory
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

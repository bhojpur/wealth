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

import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { BhojpurSymbolIconModule } from '@bhojpur/client/components/symbol-icon/symbol-icon.module';
import { BhojpurSymbolModule } from '@bhojpur/client/pipes/symbol/symbol.module';
import { BhojpurActivitiesFilterModule } from '@bhojpur/ui/activities-filter/activities-filter.module';
import { BhojpurNoTransactionsInfoModule } from '@bhojpur/ui/no-transactions-info';
import { BhojpurValueModule } from '@bhojpur/ui/value';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { ActivitiesTableComponent } from './activities-table.component';

@NgModule({
  declarations: [ActivitiesTableComponent],
  exports: [ActivitiesTableComponent],
  imports: [
    CommonModule,
    BhojpurActivitiesFilterModule,
    BhojpurNoTransactionsInfoModule,
    BhojpurSymbolIconModule,
    BhojpurSymbolModule,
    BhojpurValueModule,
    MatButtonModule,
    MatMenuModule,
    MatSortModule,
    MatTableModule,
    NgxSkeletonLoaderModule,
    RouterModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BhojpurActivitiesTableModule {}
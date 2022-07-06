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

import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '@bhojpur/client/services/data.service';
import { UserService } from '@bhojpur/client/services/user/user.service';
import { bhojpurFearAndGreedIndexSymbol } from '@bhojpur/common/config';
import { resetHours } from '@bhojpur/common/helper';
import {
  Benchmark,
  HistoricalDataItem,
  InfoItem,
  User
} from '@bhojpur/common/interfaces';
import { hasPermission, permissions } from '@bhojpur/common/permissions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'bc-home-market',
  styleUrls: ['./home-market.scss'],
  templateUrl: './home-market.html'
})
export class HomeMarketComponent implements OnDestroy, OnInit {
  public benchmarks: Benchmark[];
  public fearAndGreedIndex: number;
  public hasPermissionToAccessFearAndGreedIndex: boolean;
  public historicalData: HistoricalDataItem[];
  public info: InfoItem;
  public isLoading = true;
  public readonly numberOfDays = 180;
  public user: User;

  private unsubscribeSubject = new Subject<void>();

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private userService: UserService
  ) {
    this.info = this.dataService.fetchInfo();
    this.isLoading = true;

    this.userService.stateChanged
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((state) => {
        if (state?.user) {
          this.user = state.user;

          this.hasPermissionToAccessFearAndGreedIndex = hasPermission(
            this.user.permissions,
            permissions.accessFearAndGreedIndex
          );

          if (this.hasPermissionToAccessFearAndGreedIndex) {
            this.dataService
              .fetchSymbolItem({
                dataSource: this.info.fearAndGreedDataSource,
                includeHistoricalData: this.numberOfDays,
                symbol: bhojpurFearAndGreedIndexSymbol
              })
              .pipe(takeUntil(this.unsubscribeSubject))
              .subscribe(({ historicalData, marketPrice }) => {
                this.fearAndGreedIndex = marketPrice;
                this.historicalData = [
                  ...historicalData,
                  {
                    date: resetHours(new Date()).toISOString(),
                    value: marketPrice
                  }
                ];
                this.isLoading = false;

                this.changeDetectorRef.markForCheck();
              });
          }

          this.dataService
            .fetchBenchmarks()
            .pipe(takeUntil(this.unsubscribeSubject))
            .subscribe(({ benchmarks }) => {
              this.benchmarks = benchmarks;

              this.changeDetectorRef.markForCheck();
            });

          this.changeDetectorRef.markForCheck();
        }
      });
  }

  public ngOnInit() {}

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }
}

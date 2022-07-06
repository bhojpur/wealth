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

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { AdminService } from '@bhojpur/client/services/admin.service';
import { DataService } from '@bhojpur/client/services/data.service';
import { UserService } from '@bhojpur/client/services/user/user.service';
import { getDateFormatString } from '@bhojpur/common/helper';
import { UniqueAsset, User } from '@bhojpur/common/interfaces';
import { AdminMarketDataItem } from '@bhojpur/common/interfaces/admin-market-data.interface';
import { DataSource, MarketData } from '@prisma/client';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'bc-admin-market-data',
  styleUrls: ['./admin-market-data.scss'],
  templateUrl: './admin-market-data.html'
})
export class AdminMarketDataComponent implements OnDestroy, OnInit {
  public currentDataSource: DataSource;
  public currentSymbol: string;
  public defaultDateFormat: string;
  public marketData: AdminMarketDataItem[] = [];
  public marketDataDetails: MarketData[] = [];
  public user: User;

  private unsubscribeSubject = new Subject<void>();

  public constructor(
    private adminService: AdminService,
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private userService: UserService
  ) {
    this.userService.stateChanged
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((state) => {
        if (state?.user) {
          this.user = state.user;

          this.defaultDateFormat = getDateFormatString(
            this.user.settings.locale
          );
        }
      });
  }

  public ngOnInit() {
    this.fetchAdminMarketData();
  }

  public onDeleteProfileData({ dataSource, symbol }: UniqueAsset) {
    this.adminService
      .deleteProfileData({ dataSource, symbol })
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {});
  }

  public onGatherProfileDataBySymbol({ dataSource, symbol }: UniqueAsset) {
    this.adminService
      .gatherProfileDataBySymbol({ dataSource, symbol })
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {});
  }

  public onGatherSymbol({ dataSource, symbol }: UniqueAsset) {
    this.adminService
      .gatherSymbol({ dataSource, symbol })
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {});
  }

  public onMarketDataChanged(withRefresh: boolean = false) {
    if (withRefresh) {
      this.fetchAdminMarketData();
      this.fetchAdminMarketDataBySymbol({
        dataSource: this.currentDataSource,
        symbol: this.currentSymbol
      });
    }
  }

  public setCurrentProfile({ dataSource, symbol }: UniqueAsset) {
    this.marketDataDetails = [];

    if (this.currentSymbol === symbol) {
      this.currentDataSource = undefined;
      this.currentSymbol = '';
    } else {
      this.currentDataSource = dataSource;
      this.currentSymbol = symbol;

      this.fetchAdminMarketDataBySymbol({ dataSource, symbol });
    }
  }

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }

  private fetchAdminMarketData() {
    this.dataService
      .fetchAdminMarketData()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(({ marketData }) => {
        this.marketData = marketData;

        this.changeDetectorRef.markForCheck();
      });
  }

  private fetchAdminMarketDataBySymbol({ dataSource, symbol }: UniqueAsset) {
    this.adminService
      .fetchAdminMarketDataBySymbol({ dataSource, symbol })
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(({ marketData }) => {
        this.marketDataDetails = marketData;

        this.changeDetectorRef.markForCheck();
      });
  }
}

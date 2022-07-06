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
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AdminService } from '@bhojpur/client/services/admin.service';
import { CacheService } from '@bhojpur/client/services/cache.service';
import { DataService } from '@bhojpur/client/services/data.service';
import { UserService } from '@bhojpur/client/services/user/user.service';
import {
  PROPERTY_COUPONS,
  PROPERTY_CURRENCIES,
  PROPERTY_IS_READ_ONLY_MODE,
  PROPERTY_SYSTEM_MESSAGE
} from '@bhojpur/common/config';
import { Coupon, InfoItem, User } from '@bhojpur/common/interfaces';
import { hasPermission, permissions } from '@bhojpur/common/permissions';
import {
  differenceInSeconds,
  formatDistanceToNowStrict,
  parseISO
} from 'date-fns';
import { uniq } from 'lodash';
import { StringValue } from 'ms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'bc-admin-overview',
  styleUrls: ['./admin-overview.scss'],
  templateUrl: './admin-overview.html'
})
export class AdminOverviewComponent implements OnDestroy, OnInit {
  public couponDuration: StringValue = '30 days';
  public coupons: Coupon[];
  public customCurrencies: string[];
  public exchangeRates: { label1: string; label2: string; value: number }[];
  public hasPermissionForSubscription: boolean;
  public hasPermissionForSystemMessage: boolean;
  public hasPermissionToToggleReadOnlyMode: boolean;
  public info: InfoItem;
  public transactionCount: number;
  public userCount: number;
  public user: User;

  private unsubscribeSubject = new Subject<void>();

  public constructor(
    private adminService: AdminService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private userService: UserService
  ) {
    this.info = this.dataService.fetchInfo();

    this.userService.stateChanged
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((state) => {
        if (state?.user) {
          this.user = state.user;

          this.hasPermissionForSubscription = hasPermission(
            this.info.globalPermissions,
            permissions.enableSubscription
          );

          this.hasPermissionForSystemMessage = hasPermission(
            this.info.globalPermissions,
            permissions.enableSystemMessage
          );

          this.hasPermissionToToggleReadOnlyMode = hasPermission(
            this.user.permissions,
            permissions.toggleReadOnlyMode
          );
        }
      });
  }

  public ngOnInit() {
    this.fetchAdminData();
  }

  public formatDistanceToNow(aDateString: string) {
    if (aDateString) {
      const distanceString = formatDistanceToNowStrict(parseISO(aDateString), {
        addSuffix: true
      });

      return Math.abs(differenceInSeconds(parseISO(aDateString), new Date())) <
        60
        ? 'just now'
        : distanceString;
    }

    return '';
  }

  public onAddCoupon() {
    const coupons = [
      ...this.coupons,
      { code: this.generateCouponCode(16), duration: this.couponDuration }
    ];
    this.putCoupons(coupons);
  }

  public onAddCurrency() {
    const currency = prompt('Please add a currency:');

    if (currency) {
      const currencies = uniq([...this.customCurrencies, currency]);
      this.putCurrencies(currencies);
    }
  }

  public onChangeCouponDuration(aCouponDuration: StringValue) {
    this.couponDuration = aCouponDuration;
  }

  public onDeleteCoupon(aCouponCode: string) {
    const confirmation = confirm('Do you really want to delete this coupon?');

    if (confirmation === true) {
      const coupons = this.coupons.filter((coupon) => {
        return coupon.code !== aCouponCode;
      });
      this.putCoupons(coupons);
    }
  }

  public onDeleteCurrency(aCurrency: string) {
    const confirmation = confirm('Do you really want to delete this currency?');

    if (confirmation === true) {
      const currencies = this.customCurrencies.filter((currency) => {
        return currency !== aCurrency;
      });
      this.putCurrencies(currencies);
    }
  }

  public onDeleteSystemMessage() {
    this.putSystemMessage('');
  }

  public onFlushCache() {
    const confirmation = confirm('Do you really want to flush the cache?');

    if (confirmation === true) {
      this.cacheService
        .flush()
        .pipe(takeUntil(this.unsubscribeSubject))
        .subscribe(() => {
          setTimeout(() => {
            window.location.reload();
          }, 300);
        });
    }
  }

  public onGather7Days() {
    this.adminService
      .gather7Days()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        setTimeout(() => {
          window.location.reload();
        }, 300);
      });
  }

  public onGatherMax() {
    this.adminService
      .gatherMax()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        setTimeout(() => {
          window.location.reload();
        }, 300);
      });
  }

  public onGatherProfileData() {
    this.adminService
      .gatherProfileData()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {});
  }

  public onReadOnlyModeChange(aEvent: MatSlideToggleChange) {
    this.setReadOnlyMode(aEvent.checked);
  }

  public onSetSystemMessage() {
    const systemMessage = prompt('Please set your system message:');

    if (systemMessage) {
      this.putSystemMessage(systemMessage);
    }
  }

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }

  private fetchAdminData() {
    this.dataService
      .fetchAdminData()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(({ exchangeRates, settings, transactionCount, userCount }) => {
        this.coupons = (settings[PROPERTY_COUPONS] as Coupon[]) ?? [];
        this.customCurrencies = settings[PROPERTY_CURRENCIES] as string[];
        this.exchangeRates = exchangeRates;
        this.transactionCount = transactionCount;
        this.userCount = userCount;

        this.changeDetectorRef.markForCheck();
      });
  }

  private generateCouponCode(aLength: number) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
    let couponCode = '';

    for (let i = 0; i < aLength; i++) {
      couponCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    return couponCode;
  }

  private putCoupons(aCoupons: Coupon[]) {
    this.dataService
      .putAdminSetting(PROPERTY_COUPONS, {
        value: JSON.stringify(aCoupons)
      })
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        setTimeout(() => {
          window.location.reload();
        }, 300);
      });
  }

  private putCurrencies(aCurrencies: string[]) {
    this.dataService
      .putAdminSetting(PROPERTY_CURRENCIES, {
        value: JSON.stringify(aCurrencies)
      })
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        setTimeout(() => {
          window.location.reload();
        }, 300);
      });
  }

  private putSystemMessage(aSystemMessage: string) {
    this.dataService
      .putAdminSetting(PROPERTY_SYSTEM_MESSAGE, {
        value: aSystemMessage
      })
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        setTimeout(() => {
          window.location.reload();
        }, 300);
      });
  }

  private setReadOnlyMode(aValue: boolean) {
    this.dataService
      .putAdminSetting(PROPERTY_IS_READ_ONLY_MODE, {
        value: aValue ? 'true' : ''
      })
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        setTimeout(() => {
          window.location.reload();
        }, 300);
      });
  }
}

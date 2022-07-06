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
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountDetailDialog } from '@bhojpur/client/components/account-detail-dialog/account-detail-dialog.component';
import { AccountDetailDialogParams } from '@bhojpur/client/components/account-detail-dialog/interfaces/interfaces';
import { PositionDetailDialogParams } from '@bhojpur/client/components/position/position-detail-dialog/interfaces/interfaces';
import { PositionDetailDialog } from '@bhojpur/client/components/position/position-detail-dialog/position-detail-dialog.component';
import { DataService } from '@bhojpur/client/services/data.service';
import { ImpersonationStorageService } from '@bhojpur/client/services/impersonation-storage.service';
import { UserService } from '@bhojpur/client/services/user/user.service';
import { UNKNOWN_KEY } from '@bhojpur/common/config';
import { prettifySymbol } from '@bhojpur/common/helper';
import {
  Filter,
  PortfolioDetails,
  PortfolioPosition,
  UniqueAsset,
  User
} from '@bhojpur/common/interfaces';
import { hasPermission, permissions } from '@bhojpur/common/permissions';
import { Market, ToggleOption } from '@bhojpur/common/types';
import { Account, AssetClass, DataSource } from '@prisma/client';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  host: { class: 'page' },
  selector: 'bc-allocations-page',
  styleUrls: ['./allocations-page.scss'],
  templateUrl: './allocations-page.html'
})
export class AllocationsPageComponent implements OnDestroy, OnInit {
  public accounts: {
    [id: string]: Pick<Account, 'name'> & {
      id: string;
      value: number;
    };
  };
  public activeFilters: Filter[] = [];
  public allFilters: Filter[];
  public continents: {
    [code: string]: { name: string; value: number };
  };
  public countries: {
    [code: string]: { name: string; value: number };
  };
  public deviceType: string;
  public filters$ = new Subject<Filter[]>();
  public hasImpersonationId: boolean;
  public isLoading = false;
  public markets: {
    [key in Market]: { name: string; value: number };
  };
  public period = 'current';
  public periodOptions: ToggleOption[] = [
    { label: 'Initial', value: 'original' },
    { label: 'Current', value: 'current' }
  ];
  public placeholder = '';
  public portfolioDetails: PortfolioDetails;
  public positions: {
    [symbol: string]: Pick<
      PortfolioPosition,
      | 'assetClass'
      | 'assetSubClass'
      | 'currency'
      | 'exchange'
      | 'name'
      | 'value'
    >;
  };
  public routeQueryParams: Subscription;
  public sectors: {
    [name: string]: { name: string; value: number };
  };
  public symbols: {
    [name: string]: {
      dataSource?: DataSource;
      name: string;
      symbol: string;
      value: number;
    };
  };

  public user: User;

  private readonly SEARCH_PLACEHOLDER = 'Filter by account or tag...';
  private unsubscribeSubject = new Subject<void>();

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private deviceService: DeviceDetectorService,
    private dialog: MatDialog,
    private impersonationStorageService: ImpersonationStorageService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
    this.routeQueryParams = route.queryParams
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((params) => {
        if (params['accountId'] && params['accountDetailDialog']) {
          this.openAccountDetailDialog(params['accountId']);
        } else if (
          params['dataSource'] &&
          params['positionDetailDialog'] &&
          params['symbol']
        ) {
          this.openPositionDialog({
            dataSource: params['dataSource'],
            symbol: params['symbol']
          });
        }
      });
  }

  public ngOnInit() {
    this.deviceType = this.deviceService.getDeviceInfo().deviceType;

    this.impersonationStorageService
      .onChangeHasImpersonation()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((aId) => {
        this.hasImpersonationId = !!aId;
      });

    this.filters$
      .pipe(
        distinctUntilChanged(),
        switchMap((filters) => {
          this.isLoading = true;
          this.activeFilters = filters;
          this.placeholder =
            this.activeFilters.length <= 0 ? this.SEARCH_PLACEHOLDER : '';

          return this.dataService.fetchPortfolioDetails({
            filters: this.activeFilters
          });
        }),
        takeUntil(this.unsubscribeSubject)
      )
      .subscribe((portfolioDetails) => {
        this.portfolioDetails = portfolioDetails;

        this.initializeAnalysisData(this.period);

        this.isLoading = false;

        this.changeDetectorRef.markForCheck();
      });

    this.userService.stateChanged
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((state) => {
        if (state?.user) {
          this.user = state.user;

          const accountFilters: Filter[] = this.user.accounts
            .filter(({ accountType }) => {
              return accountType === 'SECURITIES';
            })
            .map(({ id, name }) => {
              return {
                id,
                label: name,
                type: 'ACCOUNT'
              };
            });

          const assetClassFilters: Filter[] = [];
          for (const assetClass of Object.keys(AssetClass)) {
            assetClassFilters.push({
              id: assetClass,
              label: assetClass,
              type: 'ASSET_CLASS'
            });
          }

          const tagFilters: Filter[] = this.user.tags.map(({ id, name }) => {
            return {
              id,
              label: name,
              type: 'TAG'
            };
          });

          this.allFilters = [
            ...accountFilters,
            ...assetClassFilters,
            ...tagFilters
          ];

          this.changeDetectorRef.markForCheck();
        }
      });
  }

  public initialize() {
    this.accounts = {};
    this.continents = {
      [UNKNOWN_KEY]: {
        name: UNKNOWN_KEY,
        value: 0
      }
    };
    this.countries = {
      [UNKNOWN_KEY]: {
        name: UNKNOWN_KEY,
        value: 0
      }
    };
    this.markets = {
      developedMarkets: {
        name: 'developedMarkets',
        value: 0
      },
      emergingMarkets: {
        name: 'emergingMarkets',
        value: 0
      },
      otherMarkets: {
        name: 'otherMarkets',
        value: 0
      }
    };
    this.positions = {};
    this.sectors = {
      [UNKNOWN_KEY]: {
        name: UNKNOWN_KEY,
        value: 0
      }
    };
    this.symbols = {
      [UNKNOWN_KEY]: {
        name: UNKNOWN_KEY,
        symbol: UNKNOWN_KEY,
        value: 0
      }
    };
  }

  public initializeAnalysisData(aPeriod: string) {
    this.initialize();

    for (const [id, { current, name, original }] of Object.entries(
      this.portfolioDetails.accounts
    )) {
      this.accounts[id] = {
        id,
        name,
        value: aPeriod === 'original' ? original : current
      };
    }

    for (const [symbol, position] of Object.entries(
      this.portfolioDetails.holdings
    )) {
      let value = 0;

      if (aPeriod === 'original') {
        if (this.hasImpersonationId) {
          value = position.allocationInvestment;
        } else {
          value = position.investment;
        }
      } else {
        if (this.hasImpersonationId) {
          value = position.allocationCurrent;
        } else {
          value = position.value;
        }
      }

      this.positions[symbol] = {
        value,
        assetClass: position.assetClass,
        assetSubClass: position.assetSubClass,
        currency: position.currency,
        exchange: position.exchange,
        name: position.name
      };

      if (position.assetClass !== AssetClass.CASH) {
        // Prepare analysis data by continents, countries and sectors except for cash

        if (position.countries.length > 0) {
          this.markets.developedMarkets.value +=
            position.markets.developedMarkets *
            (aPeriod === 'original' ? position.investment : position.value);
          this.markets.emergingMarkets.value +=
            position.markets.emergingMarkets *
            (aPeriod === 'original' ? position.investment : position.value);
          this.markets.otherMarkets.value +=
            position.markets.otherMarkets *
            (aPeriod === 'original' ? position.investment : position.value);

          for (const country of position.countries) {
            const { code, continent, name, weight } = country;

            if (this.continents[continent]?.value) {
              this.continents[continent].value += weight * position.value;
            } else {
              this.continents[continent] = {
                name: continent,
                value:
                  weight *
                  (aPeriod === 'original'
                    ? this.portfolioDetails.holdings[symbol].investment
                    : this.portfolioDetails.holdings[symbol].value)
              };
            }

            if (this.countries[code]?.value) {
              this.countries[code].value += weight * position.value;
            } else {
              this.countries[code] = {
                name,
                value:
                  weight *
                  (aPeriod === 'original'
                    ? this.portfolioDetails.holdings[symbol].investment
                    : this.portfolioDetails.holdings[symbol].value)
              };
            }
          }
        } else {
          this.continents[UNKNOWN_KEY].value +=
            aPeriod === 'original'
              ? this.portfolioDetails.holdings[symbol].investment
              : this.portfolioDetails.holdings[symbol].value;

          this.countries[UNKNOWN_KEY].value +=
            aPeriod === 'original'
              ? this.portfolioDetails.holdings[symbol].investment
              : this.portfolioDetails.holdings[symbol].value;
        }

        if (position.sectors.length > 0) {
          for (const sector of position.sectors) {
            const { name, weight } = sector;

            if (this.sectors[name]?.value) {
              this.sectors[name].value += weight * position.value;
            } else {
              this.sectors[name] = {
                name,
                value:
                  weight *
                  (aPeriod === 'original'
                    ? this.portfolioDetails.holdings[symbol].investment
                    : this.portfolioDetails.holdings[symbol].value)
              };
            }
          }
        } else {
          this.sectors[UNKNOWN_KEY].value +=
            aPeriod === 'original'
              ? this.portfolioDetails.holdings[symbol].investment
              : this.portfolioDetails.holdings[symbol].value;
        }
      }

      this.symbols[prettifySymbol(symbol)] = {
        dataSource: position.dataSource,
        name: position.name,
        symbol: prettifySymbol(symbol),
        value: aPeriod === 'original' ? position.investment : position.value
      };
    }

    const marketsTotal =
      this.markets.developedMarkets.value +
      this.markets.emergingMarkets.value +
      this.markets.otherMarkets.value;

    this.markets.developedMarkets.value =
      this.markets.developedMarkets.value / marketsTotal;
    this.markets.emergingMarkets.value =
      this.markets.emergingMarkets.value / marketsTotal;
    this.markets.otherMarkets.value =
      this.markets.otherMarkets.value / marketsTotal;
  }

  public onAccountChartClicked({ symbol }: UniqueAsset) {
    if (symbol) {
      this.router.navigate([], {
        queryParams: { accountId: symbol, accountDetailDialog: true }
      });
    }
  }

  public onChangePeriod(aValue: string) {
    this.period = aValue;

    this.initializeAnalysisData(this.period);
  }

  public onSymbolChartClicked({ dataSource, symbol }: UniqueAsset) {
    if (dataSource && symbol) {
      this.router.navigate([], {
        queryParams: { dataSource, symbol, positionDetailDialog: true }
      });
    }
  }

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }

  private openAccountDetailDialog(aAccountId: string) {
    const dialogRef = this.dialog.open(AccountDetailDialog, {
      autoFocus: false,
      data: <AccountDetailDialogParams>{
        accountId: aAccountId,
        deviceType: this.deviceType,
        hasImpersonationId: this.hasImpersonationId
      },
      height: this.deviceType === 'mobile' ? '97.5vh' : '80vh',
      width: this.deviceType === 'mobile' ? '100vw' : '50rem'
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        this.router.navigate(['.'], { relativeTo: this.route });
      });
  }

  private openPositionDialog({
    dataSource,
    symbol
  }: {
    dataSource: DataSource;
    symbol: string;
  }) {
    this.userService
      .get()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((user) => {
        this.user = user;

        const dialogRef = this.dialog.open(PositionDetailDialog, {
          autoFocus: false,
          data: <PositionDetailDialogParams>{
            dataSource,
            symbol,
            baseCurrency: this.user?.settings?.baseCurrency,
            deviceType: this.deviceType,
            hasImpersonationId: this.hasImpersonationId,
            hasPermissionToReportDataGlitch: hasPermission(
              this.user?.permissions,
              permissions.reportDataGlitch
            ),
            locale: this.user?.settings?.locale
          },
          height: this.deviceType === 'mobile' ? '97.5vh' : '80vh',
          width: this.deviceType === 'mobile' ? '100vw' : '50rem'
        });

        dialogRef
          .afterClosed()
          .pipe(takeUntil(this.unsubscribeSubject))
          .subscribe(() => {
            this.router.navigate(['.'], { relativeTo: this.route });
          });
      });
  }
}

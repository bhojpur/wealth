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
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    ViewChild
  } from '@angular/core';
  import { MatSort } from '@angular/material/sort';
  import { MatTableDataSource } from '@angular/material/table';
  import { Router } from '@angular/router';
  import { Activity } from '@bhojpur/api/app/order/interfaces/activities.interface';
  import { getDateFormatString } from '@bhojpur/common/helper';
  import { Filter, UniqueAsset } from '@bhojpur/common/interfaces';
  import { OrderWithAccount } from '@bhojpur/common/types';
  import Big from 'big.js';
  import { isUUID } from 'class-validator';
  import { endOfToday, format, isAfter } from 'date-fns';
  import { isNumber } from 'lodash';
  import { Subject, Subscription, distinctUntilChanged, takeUntil } from 'rxjs';
  
  @Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bc-activities-table',
    styleUrls: ['./activities-table.component.scss'],
    templateUrl: './activities-table.component.html'
  })
  export class ActivitiesTableComponent implements OnChanges, OnDestroy {
    @Input() activities: Activity[];
    @Input() baseCurrency: string;
    @Input() deviceType: string;
    @Input() hasPermissionToCreateActivity: boolean;
    @Input() hasPermissionToExportActivities: boolean;
    @Input() hasPermissionToFilter = true;
    @Input() hasPermissionToImportActivities: boolean;
    @Input() hasPermissionToOpenDetails = true;
    @Input() locale: string;
    @Input() showActions: boolean;
    @Input() showSymbolColumn = true;
  
    @Output() activityDeleted = new EventEmitter<string>();
    @Output() activityToClone = new EventEmitter<OrderWithAccount>();
    @Output() activityToUpdate = new EventEmitter<OrderWithAccount>();
    @Output() export = new EventEmitter<string[]>();
    @Output() exportDrafts = new EventEmitter<string[]>();
    @Output() import = new EventEmitter<void>();
  
    @ViewChild(MatSort) sort: MatSort;
  
    public allFilters: Filter[];
    public dataSource: MatTableDataSource<Activity> = new MatTableDataSource();
    public defaultDateFormat: string;
    public displayedColumns = [];
    public endOfToday = endOfToday();
    public filters$ = new Subject<Filter[]>();
    public hasDrafts = false;
    public isAfter = isAfter;
    public isLoading = true;
    public isUUID = isUUID;
    public placeholder = '';
    public routeQueryParams: Subscription;
    public searchKeywords: string[] = [];
    public totalFees: number;
    public totalValue: number;
  
    private readonly SEARCH_PLACEHOLDER =
      'Filter by account, currency, symbol or type...';
    private readonly SEARCH_STRING_SEPARATOR = ',';
    private unsubscribeSubject = new Subject<void>();
  
    public constructor(private router: Router) {
      this.filters$
        .pipe(distinctUntilChanged(), takeUntil(this.unsubscribeSubject))
        .subscribe((filters) => {
          this.updateFilters(filters);
        });
    }
  
    public ngOnChanges() {
      this.displayedColumns = [
        'count',
        'date',
        'type',
        'symbol',
        'quantity',
        'unitPrice',
        'fee',
        'value',
        'currency',
        'valueInBaseCurrency',
        'account',
        'actions'
      ];
  
      if (!this.showSymbolColumn) {
        this.displayedColumns = this.displayedColumns.filter((column) => {
          return column !== 'symbol';
        });
      }
  
      this.defaultDateFormat = getDateFormatString(this.locale);
  
      if (this.activities) {
        this.allFilters = this.getSearchableFieldValues(this.activities);
  
        this.dataSource = new MatTableDataSource(this.activities);
        this.dataSource.filterPredicate = (data, filter) => {
          const dataString = this.getFilterableValues(data)
            .map((currentFilter) => {
              return currentFilter.label;
            })
            .join(' ')
            .toLowerCase();
  
          let contains = true;
          for (const singleFilter of filter.split(this.SEARCH_STRING_SEPARATOR)) {
            contains =
              contains && dataString.includes(singleFilter.trim().toLowerCase());
          }
          return contains;
        };
        this.dataSource.sort = this.sort;
  
        this.updateFilters();
      }
    }
  
    public onCloneActivity(aActivity: OrderWithAccount) {
      this.activityToClone.emit(aActivity);
    }
  
    public onDeleteActivity(aId: string) {
      const confirmation = confirm('Do you really want to delete this activity?');
  
      if (confirmation) {
        this.activityDeleted.emit(aId);
      }
    }
  
    public onExport() {
      if (this.searchKeywords.length > 0) {
        this.export.emit(
          this.dataSource.filteredData.map((activity) => {
            return activity.id;
          })
        );
      } else {
        this.export.emit();
      }
    }
  
    public onExportDraft(aActivityId: string) {
      this.exportDrafts.emit([aActivityId]);
    }
  
    public onExportDrafts() {
      this.exportDrafts.emit(
        this.dataSource.filteredData
          .filter((activity) => {
            return activity.isDraft;
          })
          .map((activity) => {
            return activity.id;
          })
      );
    }
  
    public onImport() {
      this.import.emit();
    }
  
    public onOpenPositionDialog({ dataSource, symbol }: UniqueAsset): void {
      this.router.navigate([], {
        queryParams: { dataSource, symbol, positionDetailDialog: true }
      });
    }
  
    public onUpdateActivity(aActivity: OrderWithAccount) {
      this.activityToUpdate.emit(aActivity);
    }
  
    public ngOnDestroy() {
      this.unsubscribeSubject.next();
      this.unsubscribeSubject.complete();
    }
  
    private getFilterableValues(
      activity: OrderWithAccount,
      fieldValueMap: { [id: string]: Filter } = {}
    ): Filter[] {
      if (activity.Account?.id) {
        fieldValueMap[activity.Account.id] = {
          id: activity.Account.id,
          label: activity.Account.name,
          type: 'ACCOUNT'
        };
      }
  
      fieldValueMap[activity.SymbolProfile.currency] = {
        id: activity.SymbolProfile.currency,
        label: activity.SymbolProfile.currency,
        type: 'TAG'
      };
  
      if (!isUUID(activity.SymbolProfile.symbol)) {
        fieldValueMap[activity.SymbolProfile.symbol] = {
          id: activity.SymbolProfile.symbol,
          label: activity.SymbolProfile.symbol,
          type: 'SYMBOL'
        };
      }
  
      fieldValueMap[activity.type] = {
        id: activity.type,
        label: activity.type,
        type: 'TAG'
      };
  
      fieldValueMap[format(activity.date, 'yyyy')] = {
        id: format(activity.date, 'yyyy'),
        label: format(activity.date, 'yyyy'),
        type: 'TAG'
      };
  
      return Object.values(fieldValueMap);
    }
  
    private getSearchableFieldValues(activities: OrderWithAccount[]): Filter[] {
      const fieldValueMap: { [id: string]: Filter } = {};
  
      for (const activity of activities) {
        this.getFilterableValues(activity, fieldValueMap);
      }
  
      return Object.values(fieldValueMap);
    }
  
    private getTotalFees() {
      let totalFees = new Big(0);
  
      for (const activity of this.dataSource.filteredData) {
        if (isNumber(activity.feeInBaseCurrency)) {
          totalFees = totalFees.plus(activity.feeInBaseCurrency);
        } else {
          return null;
        }
      }
  
      return totalFees.toNumber();
    }
  
    private getTotalValue() {
      let totalValue = new Big(0);
  
      for (const activity of this.dataSource.filteredData) {
        if (isNumber(activity.valueInBaseCurrency)) {
          if (activity.type === 'BUY' || activity.type === 'ITEM') {
            totalValue = totalValue.plus(activity.valueInBaseCurrency);
          } else if (activity.type === 'SELL') {
            return null;
          }
        } else {
          return null;
        }
      }
  
      return totalValue.toNumber();
    }
  
    private updateFilters(filters: Filter[] = []) {
      this.isLoading = true;
  
      this.dataSource.filter = filters
        .map((filter) => {
          return filter.label;
        })
        .join(this.SEARCH_STRING_SEPARATOR);
  
      const lowercaseSearchKeywords = filters.map((filter) => {
        return filter.label.trim().toLowerCase();
      });
  
      this.placeholder =
        lowercaseSearchKeywords.length <= 0 ? this.SEARCH_PLACEHOLDER : '';
  
      this.searchKeywords = filters.map((filter) => {
        return filter.label;
      });
  
      this.hasDrafts = this.dataSource.filteredData.some((activity) => {
        return activity.isDraft === true;
      });
      this.totalFees = this.getTotalFees();
      this.totalValue = this.getTotalValue();
  
      this.isLoading = false;
    }
  }
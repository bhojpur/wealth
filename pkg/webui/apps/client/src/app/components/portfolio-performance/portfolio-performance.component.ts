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
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  getNumberFormatDecimal,
  getNumberFormatGroup
} from '@bhojpur/common/helper';
import {
  PortfolioPerformance,
  ResponseError
} from '@bhojpur/common/interfaces';
import { CountUp } from 'countup.js';
import { isNumber } from 'lodash';

@Component({
  selector: 'bc-portfolio-performance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portfolio-performance.component.html',
  styleUrls: ['./portfolio-performance.component.scss']
})
export class PortfolioPerformanceComponent implements OnChanges, OnInit {
  @Input() baseCurrency: string;
  @Input() deviceType: string;
  @Input() errors: ResponseError['errors'];
  @Input() hasError: boolean;
  @Input() isAllTimeHigh: boolean;
  @Input() isAllTimeLow: boolean;
  @Input() isLoading: boolean;
  @Input() locale: string;
  @Input() performance: PortfolioPerformance;
  @Input() showDetails: boolean;

  @ViewChild('value') value: ElementRef;

  public unit: string;

  public constructor() {}

  public ngOnInit() {}

  public ngOnChanges() {
    if (this.isLoading) {
      if (this.value?.nativeElement) {
        this.value.nativeElement.innerHTML = '';
      }
    } else {
      if (isNumber(this.performance?.currentValue)) {
        this.unit = this.baseCurrency;

        new CountUp('value', this.performance?.currentValue, {
          decimal: getNumberFormatDecimal(this.locale),
          decimalPlaces:
            this.deviceType === 'mobile' &&
            this.performance?.currentValue >= 100000
              ? 0
              : 2,
          duration: 1,
          separator: getNumberFormatGroup(this.locale)
        }).start();
      } else if (this.performance?.currentValue === null) {
        this.unit = '%';

        new CountUp(
          'value',
          this.performance?.currentNetPerformancePercent * 100,
          {
            decimal: getNumberFormatDecimal(this.locale),
            decimalPlaces: 2,
            duration: 1,
            separator: getNumberFormatGroup(this.locale)
          }
        ).start();
      }
    }
  }

  public onShowErrors() {
    const errorMessageParts = ['Data Provider Errors for'];

    for (const error of this.errors) {
      errorMessageParts.push(`${error.symbol} (${error.dataSource})`);
    }

    alert(errorMessageParts.join('\n'));
  }
}

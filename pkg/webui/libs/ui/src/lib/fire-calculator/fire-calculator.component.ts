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

import 'chartjs-adapter-date-fns';

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { getTooltipOptions } from '@bhojpur/common/chart-helper';
import { primaryColorRgb } from '@bhojpur/common/config';
import { transformTickToAbbreviation } from '@bhojpur/common/helper';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  Tooltip
} from 'chart.js';
import * as Color from 'color';
import { isNumber } from 'lodash';
import { Subject, takeUntil } from 'rxjs';

import { FireCalculatorService } from './fire-calculator.service';

@Component({
  selector: 'bc-fire-calculator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fire-calculator.component.html',
  styleUrls: ['./fire-calculator.component.scss']
})
export class FireCalculatorComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() currency: string;
  @Input() deviceType: string;
  @Input() fireWealth: number;
  @Input() hasPermissionToUpdateUserSettings: boolean;
  @Input() locale: string;
  @Input() savingsRate = 0;

  @Output() savingsRateChanged = new EventEmitter<number>();

  @ViewChild('chartCanvas') chartCanvas;

  public calculatorForm = this.formBuilder.group({
    annualInterestRate: new FormControl<number>(undefined),
    paymentPerPeriod: new FormControl<number>(undefined),
    principalInvestmentAmount: new FormControl<number>(undefined),
    time: new FormControl<number>(undefined)
  });
  public chart: Chart;
  public isLoading = true;
  public projectedTotalAmount: number;

  private unsubscribeSubject = new Subject<void>();

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private fireCalculatorService: FireCalculatorService,
    private formBuilder: FormBuilder
  ) {
    Chart.register(
      BarController,
      BarElement,
      CategoryScale,
      LinearScale,
      Tooltip
    );

    this.calculatorForm.setValue(
      {
        annualInterestRate: 5,
        paymentPerPeriod: this.savingsRate,
        principalInvestmentAmount: 0,
        time: 10
      },
      {
        emitEvent: false
      }
    );

    this.calculatorForm.valueChanges
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        this.initialize();
      });

    this.calculatorForm
      .get('paymentPerPeriod')
      .valueChanges.pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((savingsRate) => {
        this.savingsRateChanged.emit(savingsRate);
      });
  }

  public ngAfterViewInit() {
    if (isNumber(this.fireWealth) && this.fireWealth >= 0) {
      setTimeout(() => {
        // Wait for the chartCanvas
        this.calculatorForm.patchValue(
          {
            principalInvestmentAmount: this.fireWealth,
            paymentPerPeriod: this.savingsRate ?? 0
          },
          {
            emitEvent: false
          }
        );
        this.calculatorForm.get('principalInvestmentAmount').disable();

        this.changeDetectorRef.markForCheck();
      });
    }

    if (this.hasPermissionToUpdateUserSettings === true) {
      this.calculatorForm.get('paymentPerPeriod').enable({ emitEvent: false });
    } else {
      this.calculatorForm.get('paymentPerPeriod').disable({ emitEvent: false });
    }
  }

  public ngOnChanges() {
    if (isNumber(this.fireWealth) && this.fireWealth >= 0) {
      setTimeout(() => {
        // Wait for the chartCanvas
        this.calculatorForm.patchValue(
          {
            principalInvestmentAmount: this.fireWealth,
            paymentPerPeriod: this.savingsRate ?? 0
          },
          {
            emitEvent: false
          }
        );
        this.calculatorForm.get('principalInvestmentAmount').disable();

        this.changeDetectorRef.markForCheck();
      });
    }

    if (this.hasPermissionToUpdateUserSettings === true) {
      this.calculatorForm.get('paymentPerPeriod').enable({ emitEvent: false });
    } else {
      this.calculatorForm.get('paymentPerPeriod').disable({ emitEvent: false });
    }
  }

  public ngOnDestroy() {
    this.chart?.destroy();

    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }

  private initialize() {
    this.isLoading = true;

    const chartData = this.getChartData();

    if (this.chartCanvas) {
      if (this.chart) {
        this.chart.data.labels = chartData.labels;

        for (let index = 0; index < this.chart.data.datasets.length; index++) {
          this.chart.data.datasets[index].data = chartData.datasets[index].data;
        }

        this.chart.update();
      } else {
        this.chart = new Chart(this.chartCanvas.nativeElement, {
          data: chartData,
          options: {
            plugins: {
              tooltip: {
                ...getTooltipOptions(),
                mode: 'index',
                callbacks: {
                  footer: (items) => {
                    const totalAmount = items.reduce(
                      (a, b) => a + b.parsed.y,
                      0
                    );

                    return `Total: ${new Intl.NumberFormat(this.locale, {
                      currency: this.currency,
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore: Only supported from ES2020 or later
                      currencyDisplay: 'code',
                      style: 'currency'
                    }).format(totalAmount)}`;
                  },
                  label: (context) => {
                    let label = context.dataset.label || '';

                    if (label) {
                      label += ': ';
                    }

                    if (context.parsed.y !== null) {
                      label += new Intl.NumberFormat(this.locale, {
                        currency: this.currency,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore: Only supported from ES2020 or later
                        currencyDisplay: 'code',
                        style: 'currency'
                      }).format(context.parsed.y);
                    }

                    return label;
                  }
                }
              }
            },
            responsive: true,
            scales: {
              x: {
                grid: {
                  display: false
                },
                stacked: true
              },
              y: {
                display: this.deviceType !== 'mobile',
                grid: {
                  display: false
                },
                stacked: true,
                ticks: {
                  callback: (value: number) => {
                    return transformTickToAbbreviation(value);
                  }
                }
              }
            }
          },
          type: 'bar'
        });
      }
    }

    this.isLoading = false;
  }

  private getChartData() {
    const currentYear = new Date().getFullYear();
    const labels = [];

    // Principal investment amount
    const P: number =
      this.calculatorForm.get('principalInvestmentAmount').value || 0;

    // Payment per period
    const PMT = this.calculatorForm.get('paymentPerPeriod').value;

    // Annual interest rate
    const r: number = this.calculatorForm.get('annualInterestRate').value / 100;

    // Time
    const t = this.calculatorForm.get('time').value;

    for (let year = currentYear; year < currentYear + t; year++) {
      labels.push(year);
    }

    const datasetDeposit = {
      backgroundColor: `rgb(${primaryColorRgb.r}, ${primaryColorRgb.g}, ${primaryColorRgb.b})`,
      data: [],
      label: 'Deposit'
    };

    const datasetInterest = {
      backgroundColor: Color(
        `rgb(${primaryColorRgb.r}, ${primaryColorRgb.g}, ${primaryColorRgb.b})`
      )
        .lighten(0.5)
        .hex(),
      data: [],
      label: 'Interest'
    };

    const datasetSavings = {
      backgroundColor: Color(
        `rgb(${primaryColorRgb.r}, ${primaryColorRgb.g}, ${primaryColorRgb.b})`
      )
        .lighten(0.25)
        .hex(),
      data: [],
      label: 'Savings'
    };

    for (let period = 1; period <= t; period++) {
      const { interest, principal, totalAmount } =
        this.fireCalculatorService.calculateCompoundInterest({
          P,
          period,
          PMT,
          r
        });

      datasetDeposit.data.push(this.fireWealth);
      datasetInterest.data.push(interest.toNumber());
      datasetSavings.data.push(principal.minus(this.fireWealth).toNumber());

      if (period === t) {
        this.projectedTotalAmount = totalAmount.toNumber();
      }
    }

    return {
      labels,
      datasets: [datasetDeposit, datasetSavings, datasetInterest]
    };
  }
}
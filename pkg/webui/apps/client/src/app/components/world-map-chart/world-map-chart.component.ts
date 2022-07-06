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
  Input,
  OnChanges,
  OnDestroy,
  OnInit
} from '@angular/core';
import svgMap from 'svgmap';

@Component({
  selector: 'bc-world-map-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './world-map-chart.component.html',
  styleUrls: ['./world-map-chart.component.scss']
})
export class WorldMapChartComponent implements OnChanges, OnDestroy, OnInit {
  @Input() baseCurrency: string;
  @Input() countries: { [code: string]: { name: string; value: number } };
  @Input() isInPercent = false;

  public isLoading = true;
  public svgMapElement;

  public constructor(private changeDetectorRef: ChangeDetectorRef) {}

  public ngOnInit() {}

  public ngOnChanges() {
    if (this.countries) {
      this.isLoading = true;

      this.destroySvgMap();

      this.initialize();
    }
  }

  public ngOnDestroy() {
    this.destroySvgMap();
  }

  private initialize() {
    if (this.isInPercent) {
      // Convert value of countries to percentage
      let sum = 0;
      Object.keys(this.countries).map((country) => {
        sum += this.countries[country].value;
      });

      Object.keys(this.countries).map((country) => {
        this.countries[country].value = Number(
          ((this.countries[country].value * 100) / sum).toFixed(2)
        );
      });
    } else {
      // Convert value to fixed-point notation
      Object.keys(this.countries).map((country) => {
        this.countries[country].value = Number(
          this.countries[country].value.toFixed(2)
        );
      });
    }

    this.svgMapElement = new svgMap({
      colorMax: '#22bdb9',
      colorMin: '#c3f1f0',
      colorNoData: 'transparent',
      data: {
        applyData: 'value',
        data: {
          value: {
            format: this.isInPercent ? `{0}%` : `{0} ${this.baseCurrency}`
          }
        },
        values: this.countries
      },
      hideFlag: true,
      minZoom: 1.06,
      maxZoom: 1.06,
      targetElementID: 'svgMap'
    });

    setTimeout(() => {
      this.isLoading = false;

      this.changeDetectorRef.markForCheck();
    }, 500);
  }

  private destroySvgMap() {
    this.svgMapElement?.mapWrapper?.remove();
    this.svgMapElement?.tooltip?.remove();

    this.svgMapElement = null;
  }
}

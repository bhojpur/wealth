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
    Input,
    OnChanges
  } from '@angular/core';
  import { getLocale } from '@bhojpur/common/helper';
  import { isNumber } from 'lodash';
  
  @Component({
    selector: 'bc-value',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './value.component.html',
    styleUrls: ['./value.component.scss']
  })
  export class ValueComponent implements OnChanges {
    @Input() colorizeSign = false;
    @Input() currency = '';
    @Input() isAbsolute = false;
    @Input() isCurrency = false;
    @Input() isDate = false;
    @Input() isPercent = false;
    @Input() label = '';
    @Input() locale = getLocale();
    @Input() position = '';
    @Input() precision: number | undefined;
    @Input() size: 'large' | 'medium' | 'small' = 'small';
    @Input() subLabel = '';
    @Input() value: number | string = '';
  
    public absoluteValue = 0;
    public formattedValue = '';
    public isNumber = false;
    public isString = false;
    public useAbsoluteValue = false;
  
    public constructor() {}
  
    public ngOnChanges() {
      if (this.value || this.value === 0) {
        if (isNumber(this.value)) {
          this.isNumber = true;
          this.isString = false;
          this.absoluteValue = Math.abs(<number>this.value);
  
          if (this.colorizeSign) {
            if (this.currency || this.isCurrency) {
              try {
                this.formattedValue = this.absoluteValue.toLocaleString(
                  this.locale,
                  {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  }
                );
              } catch {}
            } else if (this.isPercent) {
              try {
                this.formattedValue = (this.absoluteValue * 100).toLocaleString(
                  this.locale,
                  {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  }
                );
              } catch {}
            }
          } else if (this.isPercent) {
            try {
              this.formattedValue = (this.value * 100).toLocaleString(
                this.locale,
                {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                }
              );
            } catch {}
          } else if (this.currency || this.isCurrency) {
            try {
              this.formattedValue = this.value?.toLocaleString(this.locale, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
              });
            } catch {}
          } else if (this.precision || this.precision === 0) {
            try {
              this.formattedValue = this.value?.toLocaleString(this.locale, {
                maximumFractionDigits: this.precision,
                minimumFractionDigits: this.precision
              });
            } catch {}
          } else {
            this.formattedValue = this.value?.toString();
          }
  
          if (this.isAbsolute) {
            // Remove algebraic sign
            this.formattedValue = this.formattedValue.replace(/^-/, '');
          }
        } else {
          this.isNumber = false;
          this.isString = true;
  
          if (this.isDate) {
            this.formattedValue = new Date(<string>this.value).toLocaleDateString(
              this.locale,
              {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }
            );
          } else {
            this.formattedValue = this.value;
          }
        }
      }
  
      if (this.formattedValue === '0.00') {
        this.useAbsoluteValue = true;
      }
    }
  }
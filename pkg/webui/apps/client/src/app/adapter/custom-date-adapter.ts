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

import { Platform } from '@angular/cdk/platform';
import { Inject, forwardRef } from '@angular/core';
import { MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { getDateFormatString } from '@bhojpur/common/helper';
import { format, parse } from 'date-fns';

export class CustomDateAdapter extends NativeDateAdapter {
  public constructor(
    @Inject(MAT_DATE_LOCALE) public locale: string,
    @Inject(forwardRef(() => MAT_DATE_LOCALE)) matDateLocale: string,
    platform: Platform
  ) {
    super(matDateLocale, platform);
  }

  /**
   * Formats a date as a string
   */
  public format(aDate: Date, aParseFormat: string): string {
    return format(aDate, getDateFormatString(this.locale));
  }

  /**
   * Sets the first day of the week to Monday
   */
  public getFirstDayOfWeek(): number {
    return 1;
  }

  /**
   * Parses a date from a provided value
   */
  public parse(aValue: string): Date {
    return parse(aValue, getDateFormatString(this.locale), new Date());
  }
}

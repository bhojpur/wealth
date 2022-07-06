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

import { parseDate, resetHours } from '@bhojpur/common/helper';
import { addDays, endOfDay, isBefore, isSameDay } from 'date-fns';

import { GetValueObject } from './interfaces/get-value-object.interface';
import { GetValuesParams } from './interfaces/get-values-params.interface';

function mockGetValue(symbol: string, date: Date) {
  switch (symbol) {
    case 'BALN.SW':
      if (isSameDay(parseDate('2018-11-12'), date)) {
        return { marketPrice: 146 };
      } else if (isSameDay(parseDate('2018-03-22'), date)) {
        return { marketPrice: 142.9 };
      } else if (isSameDay(parseDate('2018-03-26'), date)) {
        return { marketPrice: 139.9 };
      } else if (isSameDay(parseDate('2018-03-30'), date)) {
        return { marketPrice: 136.6 };
      } else if (isSameDay(parseDate('2018-04-18'), date)) {
        return { marketPrice: 148.9 };
      }

      return { marketPrice: 0 };

    case 'NOVN.SW':
      if (isSameDay(parseDate('2022-04-11'), date)) {
        return { marketPrice: 87.8 };
      }

      return { marketPrice: 0 };

    default:
      return { marketPrice: 0 };
  }
}

export const CurrentRateServiceMock = {
  getValues: ({
    dataGatheringItems,
    dateQuery
  }: GetValuesParams): Promise<GetValueObject[]> => {
    const result: GetValueObject[] = [];
    if (dateQuery.lt) {
      for (
        let date = resetHours(dateQuery.gte);
        isBefore(date, endOfDay(dateQuery.lt));
        date = addDays(date, 1)
      ) {
        for (const dataGatheringItem of dataGatheringItems) {
          result.push({
            date,
            marketPriceInBaseCurrency: mockGetValue(
              dataGatheringItem.symbol,
              date
            ).marketPrice,
            symbol: dataGatheringItem.symbol
          });
        }
      }
    } else {
      for (const date of dateQuery.in) {
        for (const dataGatheringItem of dataGatheringItems) {
          result.push({
            date,
            marketPriceInBaseCurrency: mockGetValue(
              dataGatheringItem.symbol,
              date
            ).marketPrice,
            symbol: dataGatheringItem.symbol
          });
        }
      }
    }
    return Promise.resolve(result);
  }
};

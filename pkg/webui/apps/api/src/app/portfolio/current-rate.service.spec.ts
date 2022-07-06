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

import { DataProviderService } from '@bhojpur/api/services/data-provider/data-provider.service';
import { ExchangeRateDataService } from '@bhojpur/api/services/exchange-rate-data.service';
import { MarketDataService } from '@bhojpur/api/services/market-data.service';
import { DataSource, MarketData } from '@prisma/client';

import { CurrentRateService } from './current-rate.service';
import { GetValueObject } from './interfaces/get-value-object.interface';

jest.mock('@bhojpur/api/services/market-data.service', () => {
  return {
    MarketDataService: jest.fn().mockImplementation(() => {
      return {
        get: (date: Date, symbol: string) => {
          return Promise.resolve<MarketData>({
            date,
            symbol,
            createdAt: date,
            dataSource: DataSource.YAHOO,
            id: 'aefcbe3a-ee10-4c4f-9f2d-8ffad7b05584',
            marketPrice: 1847.839966
          });
        },
        getRange: ({
          dateRangeEnd,
          dateRangeStart,
          symbols
        }: {
          dateRangeEnd: Date;
          dateRangeStart: Date;
          symbols: string[];
        }) => {
          return Promise.resolve<MarketData[]>([
            {
              createdAt: dateRangeStart,
              dataSource: DataSource.YAHOO,
              date: dateRangeStart,
              id: '8fa48fde-f397-4b0d-adbc-fb940e830e6d',
              marketPrice: 1841.823902,
              symbol: symbols[0]
            },
            {
              createdAt: dateRangeEnd,
              dataSource: DataSource.YAHOO,
              date: dateRangeEnd,
              id: '082d6893-df27-4c91-8a5d-092e84315b56',
              marketPrice: 1847.839966,
              symbol: symbols[0]
            }
          ]);
        }
      };
    })
  };
});

jest.mock('@bhojpur/api/services/exchange-rate-data.service', () => {
  return {
    ExchangeRateDataService: jest.fn().mockImplementation(() => {
      return {
        initialize: () => Promise.resolve(),
        toCurrency: (value: number) => {
          return 1 * value;
        }
      };
    })
  };
});

describe('CurrentRateService', () => {
  let currentRateService: CurrentRateService;
  let dataProviderService: DataProviderService;
  let exchangeRateDataService: ExchangeRateDataService;
  let marketDataService: MarketDataService;

  beforeAll(async () => {
    dataProviderService = new DataProviderService(null, [], null);
    exchangeRateDataService = new ExchangeRateDataService(
      null,
      null,
      null,
      null
    );
    marketDataService = new MarketDataService(null);

    await exchangeRateDataService.initialize();

    currentRateService = new CurrentRateService(
      dataProviderService,
      exchangeRateDataService,
      marketDataService
    );
  });

  it('getValues', async () => {
    expect(
      await currentRateService.getValues({
        currencies: { AMZN: 'USD' },
        dataGatheringItems: [{ dataSource: DataSource.YAHOO, symbol: 'AMZN' }],
        dateQuery: {
          lt: new Date(Date.UTC(2020, 0, 2, 0, 0, 0)),
          gte: new Date(Date.UTC(2020, 0, 1, 0, 0, 0))
        },
        userCurrency: 'CHF'
      })
    ).toMatchObject<GetValueObject[]>([
      {
        date: undefined,
        marketPriceInBaseCurrency: 1841.823902,
        symbol: 'AMZN'
      },
      {
        date: undefined,
        marketPriceInBaseCurrency: 1847.839966,
        symbol: 'AMZN'
      }
    ]);
  });
});

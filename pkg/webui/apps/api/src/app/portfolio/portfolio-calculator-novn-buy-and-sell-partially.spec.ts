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

import { CurrentRateService } from '@bhojpur/api/app/portfolio/current-rate.service';
import { parseDate } from '@bhojpur/common/helper';
import Big from 'big.js';

import { CurrentRateServiceMock } from './current-rate.service.mock';
import { PortfolioCalculator } from './portfolio-calculator';

jest.mock('@bhojpur/api/app/portfolio/current-rate.service', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    CurrentRateService: jest.fn().mockImplementation(() => {
      return CurrentRateServiceMock;
    })
  };
});

describe('PortfolioCalculator', () => {
  let currentRateService: CurrentRateService;

  beforeEach(() => {
    currentRateService = new CurrentRateService(null, null, null);
  });

  describe('get current positions', () => {
    it.only('with BALN.SW buy and sell', async () => {
      const portfolioCalculator = new PortfolioCalculator({
        currentRateService,
        currency: 'CHF',
        orders: [
          {
            currency: 'CHF',
            date: '2022-03-07',
            dataSource: 'YAHOO',
            fee: new Big(1.3),
            name: 'Novartis AG',
            quantity: new Big(2),
            symbol: 'NOVN.SW',
            type: 'BUY',
            unitPrice: new Big(75.8)
          },
          {
            currency: 'CHF',
            date: '2022-04-08',
            dataSource: 'YAHOO',
            fee: new Big(2.95),
            name: 'Novartis AG',
            quantity: new Big(1),
            symbol: 'NOVN.SW',
            type: 'SELL',
            unitPrice: new Big(85.73)
          }
        ]
      });

      portfolioCalculator.computeTransactionPoints();

      const spy = jest
        .spyOn(Date, 'now')
        .mockImplementation(() => parseDate('2022-04-11').getTime());

      const currentPositions = await portfolioCalculator.getCurrentPositions(
        parseDate('2022-03-07')
      );

      spy.mockRestore();

      expect(currentPositions).toEqual({
        currentValue: new Big('87.8'),
        errors: [],
        grossPerformance: new Big('21.93'),
        grossPerformancePercentage: new Big('0.14465699208443271768'),
        hasErrors: false,
        netPerformance: new Big('17.68'),
        netPerformancePercentage: new Big('0.11662269129287598945'),
        positions: [
          {
            averagePrice: new Big('75.80'),
            currency: 'CHF',
            dataSource: 'YAHOO',
            firstBuyDate: '2022-03-07',
            grossPerformance: new Big('21.93'),
            grossPerformancePercentage: new Big('0.14465699208443271768'),
            investment: new Big('75.80'),
            netPerformance: new Big('17.68'),
            netPerformancePercentage: new Big('0.11662269129287598945'),
            marketPrice: 87.8,
            quantity: new Big('1'),
            symbol: 'NOVN.SW',
            transactionCount: 2
          }
        ],
        totalInvestment: new Big('75.80')
      });
    });
  });
});

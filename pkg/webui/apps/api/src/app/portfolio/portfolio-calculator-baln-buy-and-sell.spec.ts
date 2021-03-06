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
            date: '2018-03-22',
            dataSource: 'YAHOO',
            fee: new Big(1.55),
            name: 'B??loise Holding AG',
            quantity: new Big(2),
            symbol: 'BALN.SW',
            type: 'BUY',
            unitPrice: new Big(142.9)
          },
          {
            currency: 'CHF',
            date: '2018-03-30',
            dataSource: 'YAHOO',
            fee: new Big(1.65),
            name: 'B??loise Holding AG',
            quantity: new Big(2),
            symbol: 'BALN.SW',
            type: 'SELL',
            unitPrice: new Big(136.6)
          }
        ]
      });

      portfolioCalculator.computeTransactionPoints();

      const spy = jest
        .spyOn(Date, 'now')
        .mockImplementation(() => parseDate('2018-04-18').getTime());

      const currentPositions = await portfolioCalculator.getCurrentPositions(
        parseDate('2018-03-22')
      );

      spy.mockRestore();

      expect(currentPositions).toEqual({
        currentValue: new Big('0'),
        errors: [],
        grossPerformance: new Big('-12.6'),
        grossPerformancePercentage: new Big('-0.0440867739678096571'),
        hasErrors: false,
        netPerformance: new Big('-15.8'),
        netPerformancePercentage: new Big('-0.0552834149755073478'),
        positions: [
          {
            averagePrice: new Big('0'),
            currency: 'CHF',
            dataSource: 'YAHOO',
            firstBuyDate: '2018-03-22',
            grossPerformance: new Big('-12.6'),
            grossPerformancePercentage: new Big('-0.0440867739678096571'),
            investment: new Big('0'),
            netPerformance: new Big('-15.8'),
            netPerformancePercentage: new Big('-0.0552834149755073478'),
            marketPrice: 148.9,
            quantity: new Big('0'),
            symbol: 'BALN.SW',
            transactionCount: 2
          }
        ],
        totalInvestment: new Big('0')
      });
    });
  });
});

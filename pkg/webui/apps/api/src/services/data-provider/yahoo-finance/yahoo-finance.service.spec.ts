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

import { ConfigurationService } from '@bhojpur/api/services/configuration.service';
import { CryptocurrencyService } from '@bhojpur/api/services/cryptocurrency/cryptocurrency.service';

import { YahooFinanceService } from './yahoo-finance.service';

jest.mock(
  '@bhojpur/api/services/cryptocurrency/cryptocurrency.service',
  () => {
    return {
      CryptocurrencyService: jest.fn().mockImplementation(() => {
        return {
          isCryptocurrency: (symbol: string) => {
            switch (symbol) {
              case 'BTCUSD':
                return true;
              case 'DOGEUSD':
                return true;
              default:
                return false;
            }
          }
        };
      })
    };
  }
);

describe('YahooFinanceService', () => {
  let configurationService: ConfigurationService;
  let cryptocurrencyService: CryptocurrencyService;
  let yahooFinanceService: YahooFinanceService;

  beforeAll(async () => {
    configurationService = new ConfigurationService();
    cryptocurrencyService = new CryptocurrencyService();

    yahooFinanceService = new YahooFinanceService(
      configurationService,
      cryptocurrencyService
    );
  });

  it('convertFromYahooFinanceSymbol', async () => {
    expect(
      await yahooFinanceService.convertFromYahooFinanceSymbol('BRK-B')
    ).toEqual('BRK-B');
    expect(
      await yahooFinanceService.convertFromYahooFinanceSymbol('BTC-USD')
    ).toEqual('BTCUSD');
    expect(
      await yahooFinanceService.convertFromYahooFinanceSymbol('EURUSD=X')
    ).toEqual('EURUSD');
  });

  it('convertToYahooFinanceSymbol', async () => {
    expect(
      await yahooFinanceService.convertToYahooFinanceSymbol('BTCUSD')
    ).toEqual('BTC-USD');
    expect(
      await yahooFinanceService.convertToYahooFinanceSymbol('DOGEUSD')
    ).toEqual('DOGE-USD');
    expect(
      await yahooFinanceService.convertToYahooFinanceSymbol('USDCHF')
    ).toEqual('USDCHF=X');
  });
});

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

import { LookupItem } from '@bhojpur/api/app/symbol/interfaces/lookup-item.interface';
import { ConfigurationService } from '@bhojpur/api/services/configuration.service';
import { DataProviderInterface } from '@bhojpur/api/services/data-provider/interfaces/data-provider.interface';
import {
  IDataProviderHistoricalResponse,
  IDataProviderResponse
} from '@bhojpur/api/services/interfaces/interfaces';
import { SymbolProfileService } from '@bhojpur/api/services/symbol-profile.service';
import { DATE_FORMAT } from '@bhojpur/common/helper';
import { Granularity } from '@bhojpur/common/types';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource, SymbolProfile } from '@prisma/client';
import bent from 'bent';
import { format } from 'date-fns';

@Injectable()
export class EodHistoricalDataService implements DataProviderInterface {
  private apiKey: string;
  private readonly URL = 'https://eodhistoricaldata.com/api';

  public constructor(
    private readonly configurationService: ConfigurationService,
    private readonly symbolProfileService: SymbolProfileService
  ) {
    this.apiKey = this.configurationService.get('EOD_HISTORICAL_DATA_API_KEY');
  }

  public canHandle(symbol: string) {
    return true;
  }

  public async getAssetProfile(
    aSymbol: string
  ): Promise<Partial<SymbolProfile>> {
    return {
      dataSource: this.getName()
    };
  }

  public async getHistorical(
    aSymbol: string,
    aGranularity: Granularity = 'day',
    from: Date,
    to: Date
  ): Promise<{
    [symbol: string]: { [date: string]: IDataProviderHistoricalResponse };
  }> {
    try {
      const get = bent(
        `${this.URL}/eod/${aSymbol}?api_token=${
          this.apiKey
        }&fmt=json&from=${format(from, DATE_FORMAT)}&to=${format(
          to,
          DATE_FORMAT
        )}&period={aGranularity}`,
        'GET',
        'json',
        200
      );

      const response = await get();

      return response.reduce(
        (result, historicalItem, index, array) => {
          result[aSymbol][historicalItem.date] = {
            marketPrice: historicalItem.close,
            performance: historicalItem.open - historicalItem.close
          };

          return result;
        },
        { [aSymbol]: {} }
      );
    } catch (error) {
      throw new Error(
        `Could not get historical market data for ${aSymbol} (${this.getName()}) from ${format(
          from,
          DATE_FORMAT
        )} to ${format(to, DATE_FORMAT)}: [${error.name}] ${error.message}`
      );
    }
  }

  public getName(): DataSource {
    return DataSource.EOD_HISTORICAL_DATA;
  }

  public async getQuotes(
    aSymbols: string[]
  ): Promise<{ [symbol: string]: IDataProviderResponse }> {
    if (aSymbols.length <= 0) {
      return {};
    }

    try {
      const get = bent(
        `${this.URL}/real-time/${aSymbols[0]}?api_token=${
          this.apiKey
        }&fmt=json&s=${aSymbols.join(',')}`,
        'GET',
        'json',
        200
      );

      const [response, symbolProfiles] = await Promise.all([
        get(),
        this.symbolProfileService.getSymbolProfiles(
          aSymbols.map((symbol) => {
            return {
              symbol,
              dataSource: DataSource.EOD_HISTORICAL_DATA
            };
          })
        )
      ]);

      const quotes = aSymbols.length === 1 ? [response] : response;

      return quotes.reduce((result, item, index, array) => {
        result[item.code] = {
          currency: symbolProfiles.find((symbolProfile) => {
            return symbolProfile.symbol === item.code;
          })?.currency,
          dataSource: DataSource.EOD_HISTORICAL_DATA,
          marketPrice: item.close,
          marketState: 'delayed'
        };

        return result;
      }, {});
    } catch (error) {
      Logger.error(error, 'EodHistoricalDataService');
    }

    return {};
  }

  public async search(aQuery: string): Promise<{ items: LookupItem[] }> {
    return { items: [] };
  }
}

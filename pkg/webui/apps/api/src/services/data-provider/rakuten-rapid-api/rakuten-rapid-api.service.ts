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
import { PrismaService } from '@bhojpur/api/services/prisma.service';
import { bhojpurFearAndGreedIndexSymbol } from '@bhojpur/common/config';
import { DATE_FORMAT, getToday, getYesterday } from '@bhojpur/common/helper';
import { Granularity } from '@bhojpur/common/types';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource, SymbolProfile } from '@prisma/client';
import bent from 'bent';
import { format, subMonths, subWeeks, subYears } from 'date-fns';

@Injectable()
export class RakutenRapidApiService implements DataProviderInterface {
  public constructor(
    private readonly configurationService: ConfigurationService,
    private readonly prismaService: PrismaService
  ) {}

  public canHandle(symbol: string) {
    return !!this.configurationService.get('RAKUTEN_RAPID_API_KEY');
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
      const symbol = aSymbol;

      if (symbol === bhojpurFearAndGreedIndexSymbol) {
        const fgi = await this.getFearAndGreedIndex();

        try {
          // Rebuild historical data
          // TODO: can be removed after all data from the last year has been gathered
          // (introduced on 27.03.2018)

          await this.prismaService.marketData.create({
            data: {
              symbol,
              dataSource: this.getName(),
              date: subWeeks(getToday(), 1),
              marketPrice: fgi.oneWeekAgo.value
            }
          });

          await this.prismaService.marketData.create({
            data: {
              symbol,
              dataSource: this.getName(),
              date: subMonths(getToday(), 1),
              marketPrice: fgi.oneMonthAgo.value
            }
          });

          await this.prismaService.marketData.create({
            data: {
              symbol,
              dataSource: this.getName(),
              date: subYears(getToday(), 1),
              marketPrice: fgi.oneYearAgo.value
            }
          });

          ///////////////////////////////////////////////////////////////////////////
        } catch {}

        return {
          [bhojpurFearAndGreedIndexSymbol]: {
            [format(getYesterday(), DATE_FORMAT)]: {
              marketPrice: fgi.previousClose.value
            }
          }
        };
      }
    } catch (error) {
      throw new Error(
        `Could not get historical market data for ${aSymbol} (${this.getName()}) from ${format(
          from,
          DATE_FORMAT
        )} to ${format(to, DATE_FORMAT)}: [${error.name}] ${error.message}`
      );
    }

    return {};
  }

  public getName(): DataSource {
    return DataSource.RAKUTEN;
  }

  public async getQuotes(
    aSymbols: string[]
  ): Promise<{ [symbol: string]: IDataProviderResponse }> {
    if (aSymbols.length <= 0) {
      return {};
    }

    try {
      const symbol = aSymbols[0];

      if (symbol === bhojpurFearAndGreedIndexSymbol) {
        const fgi = await this.getFearAndGreedIndex();

        return {
          [bhojpurFearAndGreedIndexSymbol]: {
            currency: undefined,
            dataSource: this.getName(),
            marketPrice: fgi.now.value,
            marketState: 'open'
          }
        };
      }
    } catch (error) {
      Logger.error(error, 'RakutenRapidApiService');
    }

    return {};
  }

  public async search(aQuery: string): Promise<{ items: LookupItem[] }> {
    return { items: [] };
  }

  private async getFearAndGreedIndex(): Promise<{
    now: { value: number; valueText: string };
    previousClose: { value: number; valueText: string };
    oneWeekAgo: { value: number; valueText: string };
    oneMonthAgo: { value: number; valueText: string };
    oneYearAgo: { value: number; valueText: string };
  }> {
    try {
      const get = bent(
        `https://fear-and-greed-index.p.rapidapi.com/v1/fgi`,
        'GET',
        'json',
        200,
        {
          useQueryString: true,
          'x-rapidapi-host': 'fear-and-greed-index.p.rapidapi.com',
          'x-rapidapi-key': this.configurationService.get(
            'RAKUTEN_RAPID_API_KEY'
          )
        }
      );

      const { fgi } = await get();
      return fgi;
    } catch (error) {
      Logger.error(error, 'RakutenRapidApiService');

      return undefined;
    }
  }
}

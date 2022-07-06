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
  DATA_GATHERING_QUEUE,
  GATHER_ASSET_PROFILE_PROCESS,
  GATHER_HISTORICAL_MARKET_DATA_PROCESS
} from '@bhojpur/common/config';
import { DATE_FORMAT } from '@bhojpur/common/helper';
import { UniqueAsset } from '@bhojpur/common/interfaces';
import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import {
  format,
  getDate,
  getMonth,
  getYear,
  isBefore,
  parseISO
} from 'date-fns';

import { DataGatheringService } from './data-gathering.service';
import { DataProviderService } from './data-provider/data-provider.service';
import { IDataGatheringItem } from './interfaces/interfaces';
import { PrismaService } from './prisma.service';

@Injectable()
@Processor(DATA_GATHERING_QUEUE)
export class DataGatheringProcessor {
  public constructor(
    private readonly dataGatheringService: DataGatheringService,
    private readonly dataProviderService: DataProviderService,
    private readonly prismaService: PrismaService
  ) {}

  @Process(GATHER_ASSET_PROFILE_PROCESS)
  public async gatherAssetProfile(job: Job<UniqueAsset>) {
    try {
      await this.dataGatheringService.gatherAssetProfiles([job.data]);
    } catch (error) {
      Logger.error(
        error,
        `DataGatheringProcessor (${GATHER_ASSET_PROFILE_PROCESS})`
      );

      throw new Error(error);
    }
  }

  @Process(GATHER_HISTORICAL_MARKET_DATA_PROCESS)
  public async gatherHistoricalMarketData(job: Job<IDataGatheringItem>) {
    try {
      const { dataSource, date, symbol } = job.data;

      const historicalData = await this.dataProviderService.getHistoricalRaw(
        [{ dataSource, symbol }],
        parseISO(<string>(<unknown>date)),
        new Date()
      );

      let currentDate = parseISO(<string>(<unknown>date));
      let lastMarketPrice: number;

      while (
        isBefore(
          currentDate,
          new Date(
            Date.UTC(
              getYear(new Date()),
              getMonth(new Date()),
              getDate(new Date()),
              0
            )
          )
        )
      ) {
        if (
          historicalData[symbol]?.[format(currentDate, DATE_FORMAT)]
            ?.marketPrice
        ) {
          lastMarketPrice =
            historicalData[symbol]?.[format(currentDate, DATE_FORMAT)]
              ?.marketPrice;
        }

        if (lastMarketPrice) {
          try {
            await this.prismaService.marketData.create({
              data: {
                dataSource,
                symbol,
                date: new Date(
                  Date.UTC(
                    getYear(currentDate),
                    getMonth(currentDate),
                    getDate(currentDate),
                    0
                  )
                ),
                marketPrice: lastMarketPrice
              }
            });
          } catch {}
        }

        // Count month one up for iteration
        currentDate = new Date(
          Date.UTC(
            getYear(currentDate),
            getMonth(currentDate),
            getDate(currentDate) + 1,
            0
          )
        );
      }

      Logger.log(
        `Historical market data gathering has been completed for ${symbol} (${dataSource}).`,
        `DataGatheringProcessor (${GATHER_HISTORICAL_MARKET_DATA_PROCESS})`
      );
    } catch (error) {
      Logger.error(
        error,
        `DataGatheringProcessor (${GATHER_HISTORICAL_MARKET_DATA_PROCESS})`
      );

      throw new Error(error);
    }
  }
}

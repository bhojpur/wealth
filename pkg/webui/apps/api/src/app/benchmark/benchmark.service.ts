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

import { RedisCacheService } from '@bhojpur/api/app/redis-cache/redis-cache.service';
import { DataProviderService } from '@bhojpur/api/services/data-provider/data-provider.service';
import { MarketDataService } from '@bhojpur/api/services/market-data.service';
import { SymbolProfileService } from '@bhojpur/api/services/symbol-profile.service';
import { BenchmarkResponse, UniqueAsset } from '@bhojpur/common/interfaces';
import { Injectable } from '@nestjs/common';
import Big from 'big.js';

@Injectable()
export class BenchmarkService {
  private readonly CACHE_KEY_BENCHMARKS = 'BENCHMARKS';

  public constructor(
    private readonly dataProviderService: DataProviderService,
    private readonly marketDataService: MarketDataService,
    private readonly redisCacheService: RedisCacheService,
    private readonly symbolProfileService: SymbolProfileService
  ) {}

  public async getBenchmarks(
    benchmarkAssets: UniqueAsset[]
  ): Promise<BenchmarkResponse['benchmarks']> {
    let benchmarks: BenchmarkResponse['benchmarks'];

    try {
      benchmarks = JSON.parse(
        await this.redisCacheService.get(this.CACHE_KEY_BENCHMARKS)
      );

      if (benchmarks) {
        return benchmarks;
      }
    } catch {}

    const promises: Promise<number>[] = [];

    const [quotes, assetProfiles] = await Promise.all([
      this.dataProviderService.getQuotes(benchmarkAssets),
      this.symbolProfileService.getSymbolProfiles(benchmarkAssets)
    ]);

    for (const benchmarkAsset of benchmarkAssets) {
      promises.push(this.marketDataService.getMax(benchmarkAsset));
    }

    const allTimeHighs = await Promise.all(promises);

    benchmarks = allTimeHighs.map((allTimeHigh, index) => {
      const { marketPrice } = quotes[benchmarkAssets[index].symbol];

      const performancePercentFromAllTimeHigh = new Big(marketPrice)
        .div(allTimeHigh)
        .minus(1);

      return {
        marketCondition: this.getMarketCondition(
          performancePercentFromAllTimeHigh
        ),
        name: assetProfiles.find(({ dataSource, symbol }) => {
          return (
            dataSource === benchmarkAssets[index].dataSource &&
            symbol === benchmarkAssets[index].symbol
          );
        })?.name,
        performances: {
          allTimeHigh: {
            performancePercent: performancePercentFromAllTimeHigh.toNumber()
          }
        }
      };
    });

    await this.redisCacheService.set(
      this.CACHE_KEY_BENCHMARKS,
      JSON.stringify(benchmarks)
    );

    return benchmarks;
  }

  private getMarketCondition(aPerformanceInPercent: Big) {
    return aPerformanceInPercent.lte(-0.2) ? 'BEAR_MARKET' : 'NEUTRAL_MARKET';
  }
}

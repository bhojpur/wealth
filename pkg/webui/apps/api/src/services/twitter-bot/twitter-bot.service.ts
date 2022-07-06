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

import { BenchmarkService } from '@bhojpur/api/app/benchmark/benchmark.service';
import { SymbolService } from '@bhojpur/api/app/symbol/symbol.service';
import { ConfigurationService } from '@bhojpur/api/services/configuration.service';
import { PropertyService } from '@bhojpur/api/services/property/property.service';
import {
  PROPERTY_BENCHMARKS,
  bhojpurFearAndGreedIndexDataSource,
  bhojpurFearAndGreedIndexSymbol
} from '@bhojpur/common/config';
import {
  resolveFearAndGreedIndex,
  resolveMarketCondition
} from '@bhojpur/common/helper';
import { UniqueAsset } from '@bhojpur/common/interfaces';
import { Injectable, Logger } from '@nestjs/common';
import { isWeekend } from 'date-fns';
import { TwitterApi, TwitterApiReadWrite } from 'twitter-api-v2';

@Injectable()
export class TwitterBotService {
  private twitterClient: TwitterApiReadWrite;

  public constructor(
    private readonly benchmarkService: BenchmarkService,
    private readonly configurationService: ConfigurationService,
    private readonly propertyService: PropertyService,
    private readonly symbolService: SymbolService
  ) {
    this.twitterClient = new TwitterApi({
      accessSecret: this.configurationService.get(
        'TWITTER_ACCESS_TOKEN_SECRET'
      ),
      accessToken: this.configurationService.get('TWITTER_ACCESS_TOKEN'),
      appKey: this.configurationService.get('TWITTER_API_KEY'),
      appSecret: this.configurationService.get('TWITTER_API_SECRET')
    }).readWrite;
  }

  public async tweetFearAndGreedIndex() {
    if (
      !this.configurationService.get('ENABLE_FEATURE_FEAR_AND_GREED_INDEX') ||
      isWeekend(new Date())
    ) {
      return;
    }

    try {
      const symbolItem = await this.symbolService.get({
        dataGatheringItem: {
          dataSource: bhojpurFearAndGreedIndexDataSource,
          symbol: bhojpurFearAndGreedIndexSymbol
        }
      });

      if (symbolItem?.marketPrice) {
        const { emoji, text } = resolveFearAndGreedIndex(
          symbolItem.marketPrice
        );

        let status = `Current Market Mood: ${emoji} ${text} (${symbolItem.marketPrice}/100)`;

        const benchmarkListing = await this.getBenchmarkListing(3);

        if (benchmarkListing?.length > 1) {
          status += '\n\n';
          status += '±% from ATH\n';
          status += benchmarkListing;
        }

        const { data: createdTweet } = await this.twitterClient.v2.tweet(
          status
        );

        Logger.log(
          `Fear & Greed Index has been tweeted: https://twitter.com/bhojpurconsult/status/${createdTweet.id}`,
          'TwitterBotService'
        );
      }
    } catch (error) {
      Logger.error(error, 'TwitterBotService');
    }
  }

  private async getBenchmarkListing(aMax: number) {
    const benchmarkAssets: UniqueAsset[] =
      ((await this.propertyService.getByKey(
        PROPERTY_BENCHMARKS
      )) as UniqueAsset[]) ?? [];

    const benchmarks = await this.benchmarkService.getBenchmarks(
      benchmarkAssets
    );

    const benchmarkListing: string[] = [];

    for (const [index, benchmark] of benchmarks.entries()) {
      if (index > aMax - 1) {
        break;
      }

      benchmarkListing.push(
        `${benchmark.name} ${(
          benchmark.performances.allTimeHigh.performancePercent * 100
        ).toFixed(1)}%${
          benchmark.marketCondition !== 'NEUTRAL_MARKET'
            ? ' ' + resolveMarketCondition(benchmark.marketCondition).emoji
            : ''
        }`
      );
    }

    return benchmarkListing.join('\n');
  }
}

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

import { ConfigurationModule } from '@bhojpur/api/services/configuration.module';
import { DataGatheringService } from '@bhojpur/api/services/data-gathering.service';
import { DataEnhancerModule } from '@bhojpur/api/services/data-provider/data-enhancer/data-enhancer.module';
import { DataProviderModule } from '@bhojpur/api/services/data-provider/data-provider.module';
import { PrismaModule } from '@bhojpur/api/services/prisma.module';
import { DATA_GATHERING_QUEUE } from '@bhojpur/common/config';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import ms from 'ms';

import { DataGatheringProcessor } from './data-gathering.processor';
import { ExchangeRateDataModule } from './exchange-rate-data.module';
import { MarketDataModule } from './market-data.module';
import { SymbolProfileModule } from './symbol-profile.module';

@Module({
  imports: [
    BullModule.registerQueue({
      limiter: {
        duration: ms('5 seconds'),
        max: 1
      },
      name: DATA_GATHERING_QUEUE
    }),
    ConfigurationModule,
    DataEnhancerModule,
    DataProviderModule,
    ExchangeRateDataModule,
    MarketDataModule,
    PrismaModule,
    SymbolProfileModule
  ],
  providers: [DataGatheringProcessor, DataGatheringService],
  exports: [BullModule, DataEnhancerModule, DataGatheringService]
})
export class DataGatheringModule {}

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

import { RedisCacheModule } from '@bhojpur/api/app/redis-cache/redis-cache.module';
import { ConfigurationModule } from '@bhojpur/api/services/configuration.module';
import { DataGatheringModule } from '@bhojpur/api/services/data-gathering.module';
import { DataProviderModule } from '@bhojpur/api/services/data-provider/data-provider.module';
import { ExchangeRateDataModule } from '@bhojpur/api/services/exchange-rate-data.module';
import { PrismaModule } from '@bhojpur/api/services/prisma.module';
import { PropertyModule } from '@bhojpur/api/services/property/property.module';
import { SymbolProfileModule } from '@bhojpur/api/services/symbol-profile.module';
import { TagModule } from '@bhojpur/api/services/tag/tag.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { InfoController } from './info.controller';
import { InfoService } from './info.service';

@Module({
  controllers: [InfoController],
  imports: [
    ConfigurationModule,
    DataGatheringModule,
    DataProviderModule,
    ExchangeRateDataModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '30 days' }
    }),
    PrismaModule,
    PropertyModule,
    RedisCacheModule,
    SymbolProfileModule,
    TagModule
  ],
  providers: [InfoService]
})
export class InfoModule {}

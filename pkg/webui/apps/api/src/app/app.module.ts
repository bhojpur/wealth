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

import { join } from 'path';

import { AuthDeviceModule } from '@bhojpur/api/app/auth-device/auth-device.module';
import { RedisCacheModule } from '@bhojpur/api/app/redis-cache/redis-cache.module';
import { ConfigurationModule } from '@bhojpur/api/services/configuration.module';
import { CronService } from '@bhojpur/api/services/cron.service';
import { DataGatheringModule } from '@bhojpur/api/services/data-gathering.module';
import { DataProviderModule } from '@bhojpur/api/services/data-provider/data-provider.module';
import { ExchangeRateDataModule } from '@bhojpur/api/services/exchange-rate-data.module';
import { PrismaModule } from '@bhojpur/api/services/prisma.module';
import { TwitterBotModule } from '@bhojpur/api/services/twitter-bot/twitter-bot.module';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AccessModule } from './access/access.module';
import { AccountModule } from './account/account.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BenchmarkModule } from './benchmark/benchmark.module';
import { CacheModule } from './cache/cache.module';
import { ExportModule } from './export/export.module';
import { ImportModule } from './import/import.module';
import { InfoModule } from './info/info.module';
import { OrderModule } from './order/order.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SymbolModule } from './symbol/symbol.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AdminModule,
    AccessModule,
    AccountModule,
    AuthDeviceModule,
    AuthModule,
    BenchmarkModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
        password: process.env.REDIS_PASSWORD
      }
    }),
    CacheModule,
    ConfigModule.forRoot(),
    ConfigurationModule,
    DataGatheringModule,
    DataProviderModule,
    ExchangeRateDataModule,
    ExportModule,
    ImportModule,
    InfoModule,
    OrderModule,
    PortfolioModule,
    PrismaModule,
    RedisCacheModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      serveStaticOptions: {
        /*etag: false // Disable etag header to fix PWA
        setHeaders: (res, path) => {
          if (path.includes('ngsw.json')) {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          }
        }*/
      },
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/api*']
    }),
    SubscriptionModule,
    SymbolModule,
    TwitterBotModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [CronService]
})
export class AppModule {}

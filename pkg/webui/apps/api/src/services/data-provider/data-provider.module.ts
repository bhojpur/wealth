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
import { CryptocurrencyModule } from '@bhojpur/api/services/cryptocurrency/cryptocurrency.module';
import { AlphaVantageService } from '@bhojpur/api/services/data-provider/alpha-vantage/alpha-vantage.service';
import { EodHistoricalDataService } from '@bhojpur/api/services/data-provider/eod-historical-data/eod-historical-data.service';
import { BhojpurScraperApiService } from '@bhojpur/api/services/data-provider/bhojpur-scraper-api/bhojpur-scraper-api.service';
import { GoogleSheetsService } from '@bhojpur/api/services/data-provider/google-sheets/google-sheets.service';
import { ManualService } from '@bhojpur/api/services/data-provider/manual/manual.service';
import { RakutenRapidApiService } from '@bhojpur/api/services/data-provider/rakuten-rapid-api/rakuten-rapid-api.service';
import { YahooFinanceService } from '@bhojpur/api/services/data-provider/yahoo-finance/yahoo-finance.service';
import { PrismaModule } from '@bhojpur/api/services/prisma.module';
import { SymbolProfileModule } from '@bhojpur/api/services/symbol-profile.module';
import { Module } from '@nestjs/common';

import { DataProviderService } from './data-provider.service';

@Module({
  imports: [
    ConfigurationModule,
    CryptocurrencyModule,
    PrismaModule,
    SymbolProfileModule
  ],
  providers: [
    AlphaVantageService,
    DataProviderService,
    EodHistoricalDataService,
    BhojpurScraperApiService,
    GoogleSheetsService,
    ManualService,
    RakutenRapidApiService,
    YahooFinanceService,
    {
      inject: [
        AlphaVantageService,
        EodHistoricalDataService,
        BhojpurScraperApiService,
        GoogleSheetsService,
        ManualService,
        RakutenRapidApiService,
        YahooFinanceService
      ],
      provide: 'DataProviderInterfaces',
      useFactory: (
        alphaVantageService,
        eodHistoricalDataService,
        bhojpurScraperApiService,
        googleSheetsService,
        manualService,
        rakutenRapidApiService,
        yahooFinanceService
      ) => [
        alphaVantageService,
        eodHistoricalDataService,
        bhojpurScraperApiService,
        googleSheetsService,
        manualService,
        rakutenRapidApiService,
        yahooFinanceService
      ]
    }
  ],
  exports: [DataProviderService, BhojpurScraperApiService]
})
export class DataProviderModule {}

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

import { SubscriptionService } from '@bhojpur/api/app/subscription/subscription.service';
import { ConfigurationService } from '@bhojpur/api/services/configuration.service';
import { DataGatheringService } from '@bhojpur/api/services/data-gathering.service';
import { ExchangeRateDataService } from '@bhojpur/api/services/exchange-rate-data.service';
import { MarketDataService } from '@bhojpur/api/services/market-data.service';
import { PrismaService } from '@bhojpur/api/services/prisma.service';
import { PropertyService } from '@bhojpur/api/services/property/property.service';
import { SymbolProfileService } from '@bhojpur/api/services/symbol-profile.service';
import { PROPERTY_CURRENCIES } from '@bhojpur/common/config';
import {
  AdminData,
  AdminMarketData,
  AdminMarketDataDetails,
  AdminMarketDataItem,
  UniqueAsset
} from '@bhojpur/common/interfaces';
import { Injectable } from '@nestjs/common';
import { Property } from '@prisma/client';
import { differenceInDays } from 'date-fns';

@Injectable()
export class AdminService {
  private baseCurrency: string;

  public constructor(
    private readonly configurationService: ConfigurationService,
    private readonly dataGatheringService: DataGatheringService,
    private readonly exchangeRateDataService: ExchangeRateDataService,
    private readonly marketDataService: MarketDataService,
    private readonly prismaService: PrismaService,
    private readonly propertyService: PropertyService,
    private readonly subscriptionService: SubscriptionService,
    private readonly symbolProfileService: SymbolProfileService
  ) {
    this.baseCurrency = this.configurationService.get('BASE_CURRENCY');
  }

  public async deleteProfileData({ dataSource, symbol }: UniqueAsset) {
    await this.marketDataService.deleteMany({ dataSource, symbol });
    await this.symbolProfileService.delete({ dataSource, symbol });
  }

  public async get(): Promise<AdminData> {
    return {
      exchangeRates: this.exchangeRateDataService
        .getCurrencies()
        .filter((currency) => {
          return currency !== this.baseCurrency;
        })
        .map((currency) => {
          return {
            label1: this.baseCurrency,
            label2: currency,
            value: this.exchangeRateDataService.toCurrency(
              1,
              this.baseCurrency,
              currency
            )
          };
        }),
      settings: await this.propertyService.get(),
      transactionCount: await this.prismaService.order.count(),
      userCount: await this.prismaService.user.count(),
      users: await this.getUsersWithAnalytics()
    };
  }

  public async getMarketData(): Promise<AdminMarketData> {
    const marketData = await this.prismaService.marketData.groupBy({
      _count: true,
      by: ['dataSource', 'symbol']
    });

    const currencyPairsToGather: AdminMarketDataItem[] =
      this.exchangeRateDataService
        .getCurrencyPairs()
        .map(({ dataSource, symbol }) => {
          const marketDataItemCount =
            marketData.find((marketDataItem) => {
              return (
                marketDataItem.dataSource === dataSource &&
                marketDataItem.symbol === symbol
              );
            })?._count ?? 0;

          return {
            dataSource,
            marketDataItemCount,
            symbol
          };
        });

    const symbolProfilesToGather: AdminMarketDataItem[] = (
      await this.prismaService.symbolProfile.findMany({
        orderBy: [{ symbol: 'asc' }],
        select: {
          _count: {
            select: { Order: true }
          },
          dataSource: true,
          Order: {
            orderBy: [{ date: 'asc' }],
            select: { date: true },
            take: 1
          },
          scraperConfiguration: true,
          symbol: true
        }
      })
    ).map((symbolProfile) => {
      const marketDataItemCount =
        marketData.find((marketDataItem) => {
          return (
            marketDataItem.dataSource === symbolProfile.dataSource &&
            marketDataItem.symbol === symbolProfile.symbol
          );
        })?._count ?? 0;

      return {
        marketDataItemCount,
        activityCount: symbolProfile._count.Order,
        dataSource: symbolProfile.dataSource,
        date: symbolProfile.Order?.[0]?.date,
        symbol: symbolProfile.symbol
      };
    });

    return {
      marketData: [...currencyPairsToGather, ...symbolProfilesToGather]
    };
  }

  public async getMarketDataBySymbol({
    dataSource,
    symbol
  }: UniqueAsset): Promise<AdminMarketDataDetails> {
    return {
      marketData: await this.marketDataService.marketDataItems({
        orderBy: {
          date: 'asc'
        },
        where: {
          dataSource,
          symbol
        }
      })
    };
  }

  public async putSetting(key: string, value: string) {
    let response: Property;

    if (value === '') {
      response = await this.propertyService.delete({ key });
    } else {
      response = await this.propertyService.put({ key, value });
    }

    if (key === PROPERTY_CURRENCIES) {
      await this.exchangeRateDataService.initialize();
    }

    return response;
  }

  private async getUsersWithAnalytics(): Promise<AdminData['users']> {
    const usersWithAnalytics = await this.prismaService.user.findMany({
      orderBy: {
        Analytics: {
          updatedAt: 'desc'
        }
      },
      select: {
        _count: {
          select: { Account: true, Order: true }
        },
        alias: true,
        Analytics: {
          select: {
            activityCount: true,
            updatedAt: true
          }
        },
        createdAt: true,
        id: true,
        Subscription: true
      },
      take: 30,
      where: {
        NOT: {
          Analytics: null
        }
      }
    });

    return usersWithAnalytics.map(
      ({ _count, alias, Analytics, createdAt, id, Subscription }) => {
        const daysSinceRegistration =
          differenceInDays(new Date(), createdAt) + 1;
        const engagement = Analytics.activityCount / daysSinceRegistration;

        const subscription = this.configurationService.get(
          'ENABLE_FEATURE_SUBSCRIPTION'
        )
          ? this.subscriptionService.getSubscription(Subscription)
          : undefined;

        return {
          alias,
          createdAt,
          engagement,
          id,
          subscription,
          accountCount: _count.Account || 0,
          lastActivity: Analytics.updatedAt,
          transactionCount: _count.Order || 0
        };
      }
    );
  }
}

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

import { PrismaService } from '@bhojpur/api/services/prisma.service';
import { UNKNOWN_KEY } from '@bhojpur/common/config';
import {
  EnhancedSymbolProfile,
  ScraperConfiguration,
  UniqueAsset
} from '@bhojpur/common/interfaces';
import { Country } from '@bhojpur/common/interfaces/country.interface';
import { Sector } from '@bhojpur/common/interfaces/sector.interface';
import { Injectable } from '@nestjs/common';
import {
  DataSource,
  Prisma,
  SymbolProfile,
  SymbolProfileOverrides
} from '@prisma/client';
import { continents, countries } from 'countries-list';

@Injectable()
export class SymbolProfileService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async delete({
    dataSource,
    symbol
  }: {
    dataSource: DataSource;
    symbol: string;
  }) {
    return this.prismaService.symbolProfile.delete({
      where: { dataSource_symbol: { dataSource, symbol } }
    });
  }

  public async deleteById(id: string) {
    return this.prismaService.symbolProfile.delete({
      where: { id }
    });
  }

  public async getSymbolProfiles(
    aUniqueAssets: UniqueAsset[]
  ): Promise<EnhancedSymbolProfile[]> {
    return this.prismaService.symbolProfile
      .findMany({
        include: { SymbolProfileOverrides: true },
        where: {
          AND: [
            {
              dataSource: {
                in: aUniqueAssets.map(({ dataSource }) => {
                  return dataSource;
                })
              },
              symbol: {
                in: aUniqueAssets.map(({ symbol }) => {
                  return symbol;
                })
              }
            }
          ]
        }
      })
      .then((symbolProfiles) => this.getSymbols(symbolProfiles));
  }

  /**
   * @deprecated
   */
  public async getSymbolProfilesBySymbols(
    symbols: string[]
  ): Promise<EnhancedSymbolProfile[]> {
    return this.prismaService.symbolProfile
      .findMany({
        include: { SymbolProfileOverrides: true },
        where: {
          symbol: {
            in: symbols
          }
        }
      })
      .then((symbolProfiles) => this.getSymbols(symbolProfiles));
  }

  private getSymbols(
    symbolProfiles: (SymbolProfile & {
      SymbolProfileOverrides: SymbolProfileOverrides;
    })[]
  ): EnhancedSymbolProfile[] {
    return symbolProfiles.map((symbolProfile) => {
      const item = {
        ...symbolProfile,
        countries: this.getCountries(
          symbolProfile?.countries as unknown as Prisma.JsonArray
        ),
        scraperConfiguration: this.getScraperConfiguration(symbolProfile),
        sectors: this.getSectors(symbolProfile),
        symbolMapping: this.getSymbolMapping(symbolProfile)
      };

      if (item.SymbolProfileOverrides) {
        item.assetClass =
          item.SymbolProfileOverrides.assetClass ?? item.assetClass;
        item.assetSubClass =
          item.SymbolProfileOverrides.assetSubClass ?? item.assetSubClass;

        if (
          (item.SymbolProfileOverrides.countries as unknown as Prisma.JsonArray)
            ?.length > 0
        ) {
          item.countries = this.getCountries(
            item.SymbolProfileOverrides
              ?.countries as unknown as Prisma.JsonArray
          );
        }

        item.name = item.SymbolProfileOverrides?.name ?? item.name;
        item.sectors =
          (item.SymbolProfileOverrides.sectors as unknown as Sector[]) ??
          item.sectors;

        delete item.SymbolProfileOverrides;
      }

      return item;
    });
  }

  private getCountries(aCountries: Prisma.JsonArray = []): Country[] {
    if (aCountries === null) {
      return [];
    }

    return aCountries.map((country: Pick<Country, 'code' | 'weight'>) => {
      const { code, weight } = country;

      return {
        code,
        weight,
        continent:
          continents[countries[code as string]?.continent] ?? UNKNOWN_KEY,
        name: countries[code as string]?.name ?? UNKNOWN_KEY
      };
    });
  }

  private getScraperConfiguration(
    symbolProfile: SymbolProfile
  ): ScraperConfiguration {
    const scraperConfiguration =
      symbolProfile.scraperConfiguration as Prisma.JsonObject;

    if (scraperConfiguration) {
      return {
        defaultMarketPrice: scraperConfiguration.defaultMarketPrice as number,
        selector: scraperConfiguration.selector as string,
        url: scraperConfiguration.url as string
      };
    }

    return null;
  }

  private getSectors(symbolProfile: SymbolProfile): Sector[] {
    return ((symbolProfile?.sectors as Prisma.JsonArray) ?? []).map(
      (sector) => {
        const { name, weight } = sector as Prisma.JsonObject;

        return {
          name: (name as string) ?? UNKNOWN_KEY,
          weight: weight as number
        };
      }
    );
  }

  private getSymbolMapping(symbolProfile: SymbolProfile) {
    return (
      (symbolProfile['symbolMapping'] as {
        [key: string]: string;
      }) ?? {}
    );
  }
}

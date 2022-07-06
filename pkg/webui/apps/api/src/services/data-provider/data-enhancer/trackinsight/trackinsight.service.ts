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

import { DataEnhancerInterface } from '@bhojpur/api/services/data-provider/interfaces/data-enhancer.interface';
import { Country } from '@bhojpur/common/interfaces/country.interface';
import { Sector } from '@bhojpur/common/interfaces/sector.interface';
import { SymbolProfile } from '@prisma/client';
import bent from 'bent';

const getJSON = bent('json');

export class TrackinsightDataEnhancerService implements DataEnhancerInterface {
  private static baseUrl = 'https://data.trackinsight.com/holdings';
  private static countries = require('countries-list/dist/countries.json');
  private static countriesMapping = {
    'Russian Federation': 'Russia'
  };
  private static sectorsMapping = {
    'Consumer Discretionary': 'Consumer Cyclical',
    'Consumer Defensive': 'Consumer Staples',
    'Health Care': 'Healthcare',
    'Information Technology': 'Technology'
  };

  public async enhance({
    response,
    symbol
  }: {
    response: Partial<SymbolProfile>;
    symbol: string;
  }): Promise<Partial<SymbolProfile>> {
    if (
      !(response.assetClass === 'EQUITY' && response.assetSubClass === 'ETF')
    ) {
      return response;
    }

    const result = await getJSON(
      `${TrackinsightDataEnhancerService.baseUrl}/${symbol}.json`
    ).catch(() => {
      return getJSON(
        `${TrackinsightDataEnhancerService.baseUrl}/${
          symbol.split('.')[0]
        }.json`
      );
    });

    if (result.weight < 0.95) {
      // Skip if data is inaccurate
      return response;
    }

    if (
      !response.countries ||
      (response.countries as unknown as Country[]).length === 0
    ) {
      response.countries = [];
      for (const [name, value] of Object.entries<any>(result.countries)) {
        let countryCode: string;

        for (const [key, country] of Object.entries<any>(
          TrackinsightDataEnhancerService.countries
        )) {
          if (
            country.name === name ||
            country.name ===
              TrackinsightDataEnhancerService.countriesMapping[name]
          ) {
            countryCode = key;
            break;
          }
        }

        response.countries.push({
          code: countryCode,
          weight: value.weight
        });
      }
    }

    if (
      !response.sectors ||
      (response.sectors as unknown as Sector[]).length === 0
    ) {
      response.sectors = [];
      for (const [name, value] of Object.entries<any>(result.sectors)) {
        response.sectors.push({
          name: TrackinsightDataEnhancerService.sectorsMapping[name] ?? name,
          weight: value.weight
        });
      }
    }

    return Promise.resolve(response);
  }

  public getName() {
    return 'TRACKINSIGHT';
  }
}

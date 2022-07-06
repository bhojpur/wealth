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

import { encodeDataSource } from '@bhojpur/common/helper';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigurationService } from '../services/configuration.service';

@Injectable()
export class TransformDataSourceInResponseInterceptor<T>
  implements NestInterceptor<T, any>
{
  public constructor(
    private readonly configurationService: ConfigurationService
  ) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        if (
          this.configurationService.get('ENABLE_FEATURE_SUBSCRIPTION') === true
        ) {
          if (data.activities) {
            data.activities.map((activity) => {
              activity.SymbolProfile.dataSource = encodeDataSource(
                activity.SymbolProfile.dataSource
              );
              return activity;
            });
          }

          if (data.dataSource) {
            data.dataSource = encodeDataSource(data.dataSource);
          }

          if (data.errors) {
            for (const error of data.errors) {
              if (error.dataSource) {
                error.dataSource = encodeDataSource(error.dataSource);
              }
            }
          }

          if (data.holdings) {
            for (const symbol of Object.keys(data.holdings)) {
              if (data.holdings[symbol].dataSource) {
                data.holdings[symbol].dataSource = encodeDataSource(
                  data.holdings[symbol].dataSource
                );
              }
            }
          }

          if (data.items) {
            data.items.map((item) => {
              item.dataSource = encodeDataSource(item.dataSource);
              return item;
            });
          }

          if (data.positions) {
            data.positions.map((position) => {
              position.dataSource = encodeDataSource(position.dataSource);
              return position;
            });
          }

          if (data.SymbolProfile) {
            data.SymbolProfile.dataSource = encodeDataSource(
              data.SymbolProfile.dataSource
            );
          }
        }

        return data;
      })
    );
  }
}

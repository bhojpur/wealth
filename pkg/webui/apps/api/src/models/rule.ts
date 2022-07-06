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

import { RuleSettings } from '@bhojpur/api/models/interfaces/rule-settings.interface';
import { UserSettings } from '@bhojpur/api/models/interfaces/user-settings.interface';
import { ExchangeRateDataService } from '@bhojpur/api/services/exchange-rate-data.service';
import { groupBy } from '@bhojpur/common/helper';
import { TimelinePosition } from '@bhojpur/common/interfaces';

import { EvaluationResult } from './interfaces/evaluation-result.interface';
import { RuleInterface } from './interfaces/rule.interface';

export abstract class Rule<T extends RuleSettings> implements RuleInterface<T> {
  private name: string;

  public constructor(
    protected exchangeRateDataService: ExchangeRateDataService,
    {
      name
    }: {
      name: string;
    }
  ) {
    this.name = name;
  }

  public getName() {
    return this.name;
  }

  public groupCurrentPositionsByAttribute(
    positions: TimelinePosition[],
    attribute: keyof TimelinePosition,
    baseCurrency: string
  ) {
    return Array.from(groupBy(attribute, positions).entries()).map(
      ([attributeValue, objs]) => ({
        groupKey: attributeValue,
        investment: objs.reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.investment.toNumber(),
          0
        ),
        value: objs.reduce(
          (previousValue, currentValue) =>
            previousValue +
            this.exchangeRateDataService.toCurrency(
              currentValue.quantity.mul(currentValue.marketPrice).toNumber(),
              currentValue.currency,
              baseCurrency
            ),
          0
        )
      })
    );
  }

  public abstract evaluate(aRuleSettings: T): EvaluationResult;

  public abstract getSettings(aUserSettings: UserSettings): T;
}

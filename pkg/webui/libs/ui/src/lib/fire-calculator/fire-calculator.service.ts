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

import { Injectable } from '@angular/core';
import Big from 'big.js';

@Injectable()
export class FireCalculatorService {
  private readonly COMPOUND_PERIOD = 12;
  private readonly CONTRIBUTION_PERIOD = 12;

  public constructor() {}

  public calculateCompoundInterest({
    P,
    period,
    PMT,
    r
  }: {
    P: number;
    period: number;
    PMT: number;
    r: number;
  }) {
    let interest = new Big(0);
    const principal = new Big(P).plus(
      new Big(PMT).mul(this.CONTRIBUTION_PERIOD).mul(period)
    );
    let totalAmount = principal;

    if (r) {
      const compoundInterestForPrincipal = new Big(1)
        .plus(new Big(r).div(this.COMPOUND_PERIOD))
        .pow(new Big(this.COMPOUND_PERIOD).mul(period).toNumber());
      const compoundInterest = new Big(P).mul(compoundInterestForPrincipal);
      const contributionInterest = new Big(
        new Big(PMT).mul(compoundInterestForPrincipal.minus(1))
      ).div(new Big(r).div(this.CONTRIBUTION_PERIOD));
      interest = compoundInterest.plus(contributionInterest).minus(principal);
      totalAmount = compoundInterest.plus(contributionInterest);
    }

    return {
      interest,
      principal,
      totalAmount
    };
  }
}
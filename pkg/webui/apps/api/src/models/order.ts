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

import { Account, SymbolProfile, Type as TypeOfOrder } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { IOrder } from '../services/interfaces/interfaces';

export class Order {
  private account: Account;
  private currency: string;
  private fee: number;
  private date: string;
  private id: string;
  private isDraft: boolean;
  private quantity: number;
  private symbol: string;
  private symbolProfile: SymbolProfile;
  private total: number;
  private type: TypeOfOrder;
  private unitPrice: number;

  public constructor(data: IOrder) {
    this.account = data.account;
    this.currency = data.currency;
    this.fee = data.fee;
    this.date = data.date;
    this.id = data.id || uuidv4();
    this.isDraft = data.isDraft;
    this.quantity = data.quantity;
    this.symbol = data.symbol;
    this.symbolProfile = data.symbolProfile;
    this.type = data.type;
    this.unitPrice = data.unitPrice;

    this.total = this.quantity * data.unitPrice;
  }

  public getAccount() {
    return this.account;
  }

  public getCurrency() {
    return this.currency;
  }

  public getDate() {
    return this.date;
  }

  public getFee() {
    return this.fee;
  }

  public getId() {
    return this.id;
  }

  public getIsDraft() {
    return this.isDraft;
  }

  public getQuantity() {
    return this.quantity;
  }

  public getSymbol() {
    return this.symbol;
  }

  getSymbolProfile() {
    return this.symbolProfile;
  }

  public getTotal() {
    return this.total;
  }

  public getType() {
    return this.type;
  }

  public getUnitPrice() {
    return this.unitPrice;
  }
}

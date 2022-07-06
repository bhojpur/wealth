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

import { ConfigurationService } from '@bhojpur/api/services/configuration.service';
import { PropertyService } from '@bhojpur/api/services/property/property.service';
import { PROPERTY_COUPONS } from '@bhojpur/common/config';
import { Coupon } from '@bhojpur/common/interfaces';
import type { RequestWithUser } from '@bhojpur/common/types';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Inject,
  Logger,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  public constructor(
    private readonly configurationService: ConfigurationService,
    private readonly propertyService: PropertyService,
    @Inject(REQUEST) private readonly request: RequestWithUser,
    private readonly subscriptionService: SubscriptionService
  ) {}

  @Post('redeem-coupon')
  @HttpCode(StatusCodes.OK)
  @UseGuards(AuthGuard('jwt'))
  public async redeemCoupon(@Body() { couponCode }: { couponCode: string }) {
    if (!this.request.user) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }

    let coupons =
      ((await this.propertyService.getByKey(PROPERTY_COUPONS)) as Coupon[]) ??
      [];

    const coupon = coupons.find((currentCoupon) => {
      return currentCoupon.code === couponCode;
    });

    if (coupon === undefined) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.BAD_REQUEST),
        StatusCodes.BAD_REQUEST
      );
    }

    await this.subscriptionService.createSubscription({
      duration: coupon.duration,
      userId: this.request.user.id
    });

    // Destroy coupon
    coupons = coupons.filter((currentCoupon) => {
      return currentCoupon.code !== couponCode;
    });
    await this.propertyService.put({
      key: PROPERTY_COUPONS,
      value: JSON.stringify(coupons)
    });

    Logger.log(
      `Subscription for user '${this.request.user.id}' has been created with a coupon for ${coupon.duration}`,
      'SubscriptionController'
    );

    return {
      message: getReasonPhrase(StatusCodes.OK),
      statusCode: StatusCodes.OK
    };
  }

  @Get('stripe/callback')
  public async stripeCallback(@Req() req, @Res() res) {
    const userId = await this.subscriptionService.createSubscriptionViaStripe(
      req.query.checkoutSessionId
    );

    Logger.log(
      `Subscription for user '${userId}' has been created via Stripe`,
      'SubscriptionController'
    );

    res.redirect(`${this.configurationService.get('ROOT_URL')}/account`);
  }

  @Post('stripe/checkout-session')
  @UseGuards(AuthGuard('jwt'))
  public async createCheckoutSession(
    @Body() { couponId, priceId }: { couponId: string; priceId: string }
  ) {
    try {
      return await this.subscriptionService.createCheckoutSession({
        couponId,
        priceId,
        userId: this.request.user.id
      });
    } catch (error) {
      Logger.error(error, 'SubscriptionController');

      throw new HttpException(
        getReasonPhrase(StatusCodes.BAD_REQUEST),
        StatusCodes.BAD_REQUEST
      );
    }
  }
}

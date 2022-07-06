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

import { CleanedEnvAccessors } from 'envalid';

export interface Environment extends CleanedEnvAccessors {
  ACCESS_TOKEN_SALT: string;
  ALPHA_VANTAGE_API_KEY: string;
  BASE_CURRENCY: string;
  CACHE_TTL: number;
  DATA_SOURCE_PRIMARY: string;
  DATA_SOURCES: string[];
  ENABLE_FEATURE_BLOG: boolean;
  ENABLE_FEATURE_CUSTOM_SYMBOLS: boolean;
  ENABLE_FEATURE_FEAR_AND_GREED_INDEX: boolean;
  ENABLE_FEATURE_IMPORT: boolean;
  ENABLE_FEATURE_READ_ONLY_MODE: boolean;
  ENABLE_FEATURE_SOCIAL_LOGIN: boolean;
  ENABLE_FEATURE_STATISTICS: boolean;
  ENABLE_FEATURE_SUBSCRIPTION: boolean;
  ENABLE_FEATURE_SYSTEM_MESSAGE: boolean;
  EOD_HISTORICAL_DATA_API_KEY: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_SECRET: string;
  GOOGLE_SHEETS_ACCOUNT: string;
  GOOGLE_SHEETS_ID: string;
  GOOGLE_SHEETS_PRIVATE_KEY: string;
  JWT_SECRET_KEY: string;
  MAX_ITEM_IN_CACHE: number;
  MAX_ORDERS_TO_IMPORT: number;
  PORT: number;
  RAKUTEN_RAPID_API_KEY: string;
  REDIS_HOST: string;
  REDIS_PASSWORD: string;
  REDIS_PORT: number;
  ROOT_URL: string;
  STRIPE_PUBLIC_KEY: string;
  STRIPE_SECRET_KEY: string;
  TWITTER_ACCESS_TOKEN: string;
  TWITTER_ACCESS_TOKEN_SECRET: string;
  TWITTER_API_KEY: string;
  TWITTER_API_SECRET: string;
  WEB_AUTH_RP_ID: string;
}

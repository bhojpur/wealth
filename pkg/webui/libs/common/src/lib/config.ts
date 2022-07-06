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

import { DataSource } from '@prisma/client';
import { JobOptions, JobStatus } from 'bull';
import ms from 'ms';

import { ToggleOption } from './types';

export const defaultDateRangeOptions: ToggleOption[] = [
  { label: 'Today', value: '1d' },
  { label: 'YTD', value: 'ytd' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
  { label: 'Max', value: 'max' }
];

export const DEMO_USER_ID = '9b112b4d-3b7d-4bad-9bdd-3b0f7b4dac2f';

export const bhojpurScraperApiSymbolPrefix = '_GF_';
export const bhojpurCashSymbol = `${bhojpurScraperApiSymbolPrefix}CASH`;
export const bhojpurFearAndGreedIndexDataSource = DataSource.RAKUTEN;
export const bhojpurFearAndGreedIndexSymbol = `${bhojpurScraperApiSymbolPrefix}FEAR_AND_GREED_INDEX`;

export const locale = 'en-US';

export const primaryColorHex = '#36cfcc';
export const primaryColorRgb = {
  r: 54,
  g: 207,
  b: 204
};

export const secondaryColorHex = '#3686cf';
export const secondaryColorRgb = {
  r: 54,
  g: 134,
  b: 207
};

export const warnColorHex = '#dc3545';
export const warnColorRgb = {
  r: 220,
  g: 53,
  b: 69
};

export const ASSET_SUB_CLASS_EMERGENCY_FUND = 'EMERGENCY_FUND';

export const DATA_GATHERING_QUEUE = 'DATA_GATHERING_QUEUE';
export const DATA_GATHERING_QUEUE_PRIORITY_LOW = Number.MAX_SAFE_INTEGER;
export const DATA_GATHERING_QUEUE_PRIORITY_HIGH = 1;

export const DEFAULT_DATE_FORMAT_MONTH_YEAR = 'MMM yyyy';

export const GATHER_ASSET_PROFILE_PROCESS = 'GATHER_ASSET_PROFILE';
export const GATHER_ASSET_PROFILE_PROCESS_OPTIONS: JobOptions = {
  attempts: 10,
  backoff: {
    delay: ms('1 minute'),
    type: 'exponential'
  },
  priority: DATA_GATHERING_QUEUE_PRIORITY_HIGH,
  removeOnComplete: {
    age: ms('2 weeks') / 1000
  }
};
export const GATHER_HISTORICAL_MARKET_DATA_PROCESS =
  'GATHER_HISTORICAL_MARKET_DATA';
export const GATHER_HISTORICAL_MARKET_DATA_PROCESS_OPTIONS: JobOptions = {
  attempts: 10,
  backoff: {
    delay: ms('1 minute'),
    type: 'exponential'
  },
  priority: DATA_GATHERING_QUEUE_PRIORITY_LOW,
  removeOnComplete: {
    age: ms('2 weeks') / 1000
  }
};

export const PROPERTY_BENCHMARKS = 'BENCHMARKS';
export const PROPERTY_COUPONS = 'COUPONS';
export const PROPERTY_CURRENCIES = 'CURRENCIES';
export const PROPERTY_IS_READ_ONLY_MODE = 'IS_READ_ONLY_MODE';
export const PROPERTY_SLACK_COMMUNITY_USERS = 'SLACK_COMMUNITY_USERS';
export const PROPERTY_STRIPE_CONFIG = 'STRIPE_CONFIG';
export const PROPERTY_SYSTEM_MESSAGE = 'SYSTEM_MESSAGE';

export const QUEUE_JOB_STATUS_LIST = <JobStatus[]>[
  'active',
  'completed',
  'delayed',
  'failed',
  'paused',
  'waiting'
];

export const UNKNOWN_KEY = 'UNKNOWN';
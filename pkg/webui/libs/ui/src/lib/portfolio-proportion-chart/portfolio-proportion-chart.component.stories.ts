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

import { CommonModule } from '@angular/common';
import { Meta, Story, moduleMetadata } from '@storybook/angular';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { PortfolioProportionChartComponent } from './portfolio-proportion-chart.component';

export default {
  title: 'Portfolio Proportion Chart',
  component: PortfolioProportionChartComponent,
  decorators: [
    moduleMetadata({
      declarations: [PortfolioProportionChartComponent],
      imports: [CommonModule, NgxSkeletonLoaderModule]
    })
  ]
} as Meta<PortfolioProportionChartComponent>;

const Template: Story<PortfolioProportionChartComponent> = (
  args: PortfolioProportionChartComponent
) => ({
  props: args
});

export const Simple = Template.bind({});
Simple.args = {
  baseCurrency: 'INR',
  keys: ['name'],
  locale: 'en-US',
  positions: {
    Africa: { name: 'Africa', value: 983.22461479889288 },
    Asia: { name: 'Asia', value: 12074.754633964973 },
    Europe: { name: 'Europe', value: 34432.837085290535 },
    'North America': { name: 'North America', value: 26539.89987780503 },
    Oceania: { name: 'Oceania', value: 1402.220605072031 },
    'South America': { name: 'South America', value: 4938.25202180719859 }
  }
};
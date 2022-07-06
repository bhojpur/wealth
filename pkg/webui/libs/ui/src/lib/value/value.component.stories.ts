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

import { Meta, Story, moduleMetadata } from '@storybook/angular';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { ValueComponent } from './value.component';

export default {
  title: 'Value',
  component: ValueComponent,
  decorators: [
    moduleMetadata({
      imports: [NgxSkeletonLoaderModule]
    })
  ]
} as Meta<ValueComponent>;

const Template: Story<ValueComponent> = (args: ValueComponent) => ({
  props: args
});

export const Loading = Template.bind({});
Loading.args = {
  value: undefined
};

export const Currency = Template.bind({});
Currency.args = {
  currency: 'INR',
  locale: 'en-US',
  value: 7
};

export const Label = Template.bind({});
Label.args = {
  label: 'Label',
  locale: 'en-US',
  value: 7.25
};

export const PerformancePositive = Template.bind({});
PerformancePositive.args = {
  locale: 'en-US',
  colorizeSign: true,
  isPercent: true,
  value: 0.0136810853673890378
};
PerformancePositive.storyName = 'Performance (positive)';

export const PerformanceNegative = Template.bind({});
PerformanceNegative.args = {
  locale: 'en-US',
  colorizeSign: true,
  isPercent: true,
  value: -0.0136810853673890378
};
PerformanceNegative.storyName = 'Performance (negative)';

export const PerformanceCloseToZero = Template.bind({});
PerformanceCloseToZero.args = {
  locale: 'en-US',
  colorizeSign: true,
  isPercent: true,
  value: -2.388915360475e-8
};
PerformanceCloseToZero.storyName = 'Performance (negative zero)';

export const Precision = Template.bind({});
Precision.args = {
  locale: 'en-US',
  precision: 3,
  value: 7.2534802394809285309
};
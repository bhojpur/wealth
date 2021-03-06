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

import { Chart, TooltipPosition } from 'chart.js';

import { getBackgroundColor, getTextColor } from './helper';

export function getTooltipOptions(currency = '', locale = '') {
  return {
    backgroundColor: getBackgroundColor(),
    bodyColor: `rgb(${getTextColor()})`,
    borderWidth: 1,
    borderColor: `rgba(${getTextColor()}, 0.1)`,
    callbacks: {
      label: (context) => {
        let label = context.dataset.label || '';
        if (label) {
          label += ': ';
        }
        if (context.parsed.y !== null) {
          if (currency) {
            label += `${context.parsed.y.toLocaleString(locale, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2
            })} ${currency}`;
          } else {
            label += context.parsed.y.toFixed(2);
          }
        }
        return label;
      }
    },
    caretSize: 0,
    cornerRadius: 2,
    footerColor: `rgb(${getTextColor()})`,
    itemSort: (a, b) => {
      // Reverse order
      return b.datasetIndex - a.datasetIndex;
    },
    titleColor: `rgb(${getTextColor()})`,
    usePointStyle: true
  };
}

export function getTooltipPositionerMapTop(
  chart: Chart,
  position: TooltipPosition
) {
  if (!position) {
    return false;
  }
  return {
    x: position.x,
    y: chart.chartArea.top
  };
}

export function getVerticalHoverLinePlugin(chartCanvas) {
  return {
    afterDatasetsDraw: (chart, x, options) => {
      const active = chart.getActiveElements();

      if (!active || active.length === 0) {
        return;
      }

      const color = options.color || `rgb(${getTextColor()})`;
      const width = options.width || 1;

      const {
        chartArea: { bottom, top }
      } = chart;
      const xValue = active[0].element.x;

      const context = chartCanvas.nativeElement.getContext('2d');
      context.lineWidth = width;
      context.strokeStyle = color;

      context.beginPath();
      context.moveTo(xValue, top);
      context.lineTo(xValue, bottom);
      context.stroke();
    },
    id: 'verticalHoverLine'
  };
}
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

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit
} from '@angular/core';
import { Position } from '@bhojpur/common/interfaces';

@Component({
  selector: 'bc-positions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss']
})
export class PositionsComponent implements OnChanges, OnInit {
  @Input() baseCurrency: string;
  @Input() deviceType: string;
  @Input() hasPermissionToCreateOrder: boolean;
  @Input() locale: string;
  @Input() positions: Position[];
  @Input() range: string;

  public hasPositions: boolean;
  public positionsRest: Position[] = [];
  public positionsWithPriority: Position[] = [];

  public constructor() {}

  public ngOnInit() {}

  public ngOnChanges() {
    if (this.positions) {
      this.hasPositions = this.positions.length > 0;

      if (!this.hasPositions) {
        return;
      }

      this.positionsRest = [];
      this.positionsWithPriority = [];

      for (const portfolioPosition of this.positions) {
        if (portfolioPosition.marketState === 'open' || this.range !== '1d') {
          // Only show positions where the market is open in today's view
          this.positionsWithPriority.push(portfolioPosition);
        } else {
          this.positionsRest.push(portfolioPosition);
        }
      }

      this.positionsRest.sort((a, b) =>
        (a.name || a.symbol)?.toLowerCase() >
        (b.name || b.symbol)?.toLowerCase()
          ? 1
          : -1
      );
      this.positionsWithPriority.sort((a, b) =>
        (a.name || a.symbol)?.toLowerCase() >
        (b.name || b.symbol)?.toLowerCase()
          ? 1
          : -1
      );
    } else {
      this.hasPositions = false;
    }
  }
}

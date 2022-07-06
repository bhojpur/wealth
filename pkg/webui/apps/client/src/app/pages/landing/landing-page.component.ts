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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { Subject } from 'rxjs';

@Component({
  host: { class: 'page' },
  selector: 'bc-landing-page',
  styleUrls: ['./landing-page.scss'],
  templateUrl: './landing-page.html'
})
export class LandingPageComponent implements OnDestroy, OnInit {
  public currentYear = format(new Date(), 'yyyy');
  public demoAuthToken: string;
  public testimonials = [
    {
      author: 'Bimla',
      country: 'Germany 🇩🇪',
      quote: `Super slim app with a great user interface. On top of that, it's open source.`
    },
    {
      author: 'Divya',
      country: 'Switzerland 🇨🇭',
      quote: `Bhojpur Wealth looks like the perfect portfolio tracker I've been searching for all these years.`
    },
    {
      author: 'Anushka',
      country: 'Netherlands 🇳🇱',
      quote: `A fantastic app to track my investments across platforms. Love the simplicity of its design and the depth of the insights.`
    },
    {
      author: 'Pramila',
      country: 'Slovenia 🇸🇮',
      quote: `Bhojpur Wealth helps me track all my investments in one place, it has a built-in portfolio analyzer and a very neat, seamless user interface.`
    }
  ];

  private unsubscribeSubject = new Subject<void>();

  public constructor() {}

  public ngOnInit() {}

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }
}

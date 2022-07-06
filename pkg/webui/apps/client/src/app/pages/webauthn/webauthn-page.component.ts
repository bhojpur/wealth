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

import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '@bhojpur/client/services/token-storage.service';
import { WebAuthnService } from '@bhojpur/client/services/web-authn.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  host: { class: 'page' },
  selector: 'bc-webauthn-page',
  styleUrls: ['./webauthn-page.scss'],
  templateUrl: './webauthn-page.html'
})
export class WebauthnPageComponent implements OnDestroy, OnInit {
  public hasError = false;

  private unsubscribeSubject = new Subject<void>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private tokenStorageService: TokenStorageService,
    private webAuthnService: WebAuthnService
  ) {}

  public ngOnInit() {
    this.signIn();
  }

  public deregisterDevice() {
    this.webAuthnService
      .deregister()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  public signIn() {
    this.hasError = false;

    this.webAuthnService
      .login()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(
        ({ authToken }) => {
          this.tokenStorageService.saveToken(authToken, false);
          this.router.navigate(['/']);
        },
        (error) => {
          console.error(error);
          this.hasError = true;
          this.changeDetectorRef.markForCheck();
        }
      );
  }

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }
}

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
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataService } from '@bhojpur/client/services/data.service';
import { TokenStorageService } from '@bhojpur/client/services/token-storage.service';
import { InfoItem } from '@bhojpur/common/interfaces';
import { hasPermission, permissions } from '@bhojpur/common/permissions';
import { LineChartItem } from '@bhojpur/ui/line-chart/interfaces/line-chart.interface';
import { Role } from '@prisma/client';
import { format } from 'date-fns';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ShowAccessTokenDialog } from './show-access-token-dialog/show-access-token-dialog.component';

@Component({
  host: { class: 'page' },
  selector: 'bc-register-page',
  styleUrls: ['./register-page.scss'],
  templateUrl: './register-page.html'
})
export class RegisterPageComponent implements OnDestroy, OnInit {
  public currentYear = format(new Date(), 'yyyy');
  public demoAuthToken: string;
  public deviceType: string;
  public hasPermissionForSocialLogin: boolean;
  public historicalDataItems: LineChartItem[];
  public info: InfoItem;

  private unsubscribeSubject = new Subject<void>();

  public constructor(
    private dataService: DataService,
    private deviceService: DeviceDetectorService,
    private dialog: MatDialog,
    private router: Router,
    private tokenStorageService: TokenStorageService
  ) {
    this.info = this.dataService.fetchInfo();

    this.tokenStorageService.signOut();
  }

  public ngOnInit() {
    const { demoAuthToken, globalPermissions } = this.dataService.fetchInfo();

    this.demoAuthToken = demoAuthToken;
    this.deviceType = this.deviceService.getDeviceInfo().deviceType;
    this.hasPermissionForSocialLogin = hasPermission(
      globalPermissions,
      permissions.enableSocialLogin
    );
  }

  public async createAccount() {
    this.dataService
      .postUser()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(({ accessToken, authToken, role }) => {
        this.openShowAccessTokenDialog(accessToken, authToken, role);
      });
  }

  public openShowAccessTokenDialog(
    accessToken: string,
    authToken: string,
    role: Role
  ): void {
    const dialogRef = this.dialog.open(ShowAccessTokenDialog, {
      data: {
        accessToken,
        authToken,
        role
      },
      disableClose: true,
      width: '30rem'
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((data) => {
        if (data?.authToken) {
          this.tokenStorageService.saveToken(authToken, true);

          this.router.navigate(['/']);
        }
      });
  }

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }
}

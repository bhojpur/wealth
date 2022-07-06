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
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from '@bhojpur/client/services/admin.service';
import { UserService } from '@bhojpur/client/services/user/user.service';
import { QUEUE_JOB_STATUS_LIST } from '@bhojpur/common/config';
import { getDateWithTimeFormatString } from '@bhojpur/common/helper';
import { AdminJobs, User } from '@bhojpur/common/interfaces';
import { JobStatus } from 'bull';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'bc-admin-jobs',
  styleUrls: ['./admin-jobs.scss'],
  templateUrl: './admin-jobs.html'
})
export class AdminJobsComponent implements OnDestroy, OnInit {
  public defaultDateTimeFormat: string;
  public filterForm: FormGroup;
  public jobs: AdminJobs['jobs'] = [];
  public statusFilterOptions = QUEUE_JOB_STATUS_LIST;
  public user: User;

  private unsubscribeSubject = new Subject<void>();

  public constructor(
    private adminService: AdminService,
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {
    this.userService.stateChanged
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((state) => {
        if (state?.user) {
          this.user = state.user;

          this.defaultDateTimeFormat = getDateWithTimeFormatString(
            this.user.settings.locale
          );
        }
      });
  }

  public ngOnInit() {
    this.filterForm = this.formBuilder.group({
      status: []
    });

    this.filterForm.valueChanges
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        const currentFilter = this.filterForm.get('status').value;
        this.fetchJobs(currentFilter ? [currentFilter] : undefined);
      });

    this.fetchJobs();
  }

  public onDeleteJob(aId: string) {
    this.adminService
      .deleteJob(aId)
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        this.fetchJobs();
      });
  }

  public onDeleteJobs() {
    const currentFilter = this.filterForm.get('status').value;

    this.adminService
      .deleteJobs({ status: currentFilter ? [currentFilter] : undefined })
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        this.fetchJobs(currentFilter ? [currentFilter] : undefined);
      });
  }

  public onViewData(aData: AdminJobs['jobs'][0]['data']) {
    alert(JSON.stringify(aData, null, '  '));
  }

  public onViewStacktrace(aStacktrace: AdminJobs['jobs'][0]['stacktrace']) {
    alert(JSON.stringify(aStacktrace, null, '  '));
  }

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }

  private fetchJobs(aStatus?: JobStatus[]) {
    this.adminService
      .fetchJobs({ status: aStatus })
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(({ jobs }) => {
        this.jobs = jobs;

        this.changeDetectorRef.markForCheck();
      });
  }
}

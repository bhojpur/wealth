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

import { AdminJobs } from '@bhojpur/common/interfaces';
import { hasPermission, permissions } from '@bhojpur/common/permissions';
import type { RequestWithUser } from '@bhojpur/common/types';
import {
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JobStatus } from 'bull';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

import { QueueService } from './queue.service';

@Controller('admin/queue')
export class QueueController {
  public constructor(
    private readonly queueService: QueueService,
    @Inject(REQUEST) private readonly request: RequestWithUser
  ) {}

  @Delete('job')
  @UseGuards(AuthGuard('jwt'))
  public async deleteJobs(
    @Query('status') filterByStatus?: string
  ): Promise<void> {
    if (
      !hasPermission(
        this.request.user.permissions,
        permissions.accessAdminControl
      )
    ) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }

    const status = <JobStatus[]>filterByStatus?.split(',') ?? undefined;
    return this.queueService.deleteJobs({ status });
  }

  @Get('job')
  @UseGuards(AuthGuard('jwt'))
  public async getJobs(
    @Query('status') filterByStatus?: string
  ): Promise<AdminJobs> {
    if (
      !hasPermission(
        this.request.user.permissions,
        permissions.accessAdminControl
      )
    ) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }

    const status = <JobStatus[]>filterByStatus?.split(',') ?? undefined;
    return this.queueService.getJobs({ status });
  }

  @Delete('job/:id')
  @UseGuards(AuthGuard('jwt'))
  public async deleteJob(@Param('id') id: string): Promise<void> {
    if (
      !hasPermission(
        this.request.user.permissions,
        permissions.accessAdminControl
      )
    ) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }

    return this.queueService.deleteJob(id);
  }
}

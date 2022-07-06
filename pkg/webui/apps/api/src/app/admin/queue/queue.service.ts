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
  DATA_GATHERING_QUEUE,
  QUEUE_JOB_STATUS_LIST
} from '@bhojpur/common/config';
import { AdminJobs } from '@bhojpur/common/interfaces';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { JobStatus, Queue } from 'bull';

@Injectable()
export class QueueService {
  public constructor(
    @InjectQueue(DATA_GATHERING_QUEUE)
    private readonly dataGatheringQueue: Queue
  ) {}

  public async deleteJob(aId: string) {
    return (await this.dataGatheringQueue.getJob(aId))?.remove();
  }

  public async deleteJobs({
    status = QUEUE_JOB_STATUS_LIST
  }: {
    status?: JobStatus[];
  }) {
    const jobs = await this.dataGatheringQueue.getJobs(status);

    for (const job of jobs) {
      try {
        await job.remove();
      } catch (error) {
        Logger.warn(error, 'QueueService');
      }
    }
  }

  public async getJobs({
    limit = 1000,
    status = QUEUE_JOB_STATUS_LIST
  }: {
    limit?: number;
    status?: JobStatus[];
  }): Promise<AdminJobs> {
    const jobs = await this.dataGatheringQueue.getJobs(status);

    const jobsWithState = await Promise.all(
      jobs.slice(0, limit).map(async (job) => {
        return {
          attemptsMade: job.attemptsMade + 1,
          data: job.data,
          finishedOn: job.finishedOn,
          id: job.id,
          name: job.name,
          stacktrace: job.stacktrace,
          state: await job.getState(),
          timestamp: job.timestamp
        };
      })
    );

    return {
      jobs: jobsWithState
    };
  }
}

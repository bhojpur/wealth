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

import { PrismaService } from '@bhojpur/api/services/prisma.service';
import { AccessWithGranteeUser } from '@bhojpur/common/types';
import { Injectable } from '@nestjs/common';
import { Access, Prisma } from '@prisma/client';

@Injectable()
export class AccessService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async access(
    accessWhereInput: Prisma.AccessWhereInput
  ): Promise<AccessWithGranteeUser | null> {
    return this.prismaService.access.findFirst({
      include: {
        GranteeUser: true
      },
      where: accessWhereInput
    });
  }

  public async accesses(params: {
    include?: Prisma.AccessInclude;
    skip?: number;
    take?: number;
    cursor?: Prisma.AccessWhereUniqueInput;
    where?: Prisma.AccessWhereInput;
    orderBy?: Prisma.AccessOrderByWithRelationInput;
  }): Promise<AccessWithGranteeUser[]> {
    const { include, skip, take, cursor, where, orderBy } = params;

    return this.prismaService.access.findMany({
      cursor,
      include,
      orderBy,
      skip,
      take,
      where
    });
  }

  public async createAccess(data: Prisma.AccessCreateInput): Promise<Access> {
    return this.prismaService.access.create({
      data
    });
  }

  public async deleteAccess(
    where: Prisma.AccessWhereUniqueInput
  ): Promise<Access> {
    return this.prismaService.access.delete({
      where
    });
  }
}

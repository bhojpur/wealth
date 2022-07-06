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

import { ConfigurationService } from '@bhojpur/api/services/configuration.service';
import { PrismaService } from '@bhojpur/api/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { AuthDevice, Prisma } from '@prisma/client';

@Injectable()
export class AuthDeviceService {
  public constructor(
    private readonly configurationService: ConfigurationService,
    private readonly prismaService: PrismaService
  ) {}

  public async authDevice(
    where: Prisma.AuthDeviceWhereUniqueInput
  ): Promise<AuthDevice | null> {
    return this.prismaService.authDevice.findUnique({
      where
    });
  }

  public async authDevices(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AuthDeviceWhereUniqueInput;
    where?: Prisma.AuthDeviceWhereInput;
    orderBy?: Prisma.AuthDeviceOrderByWithRelationInput;
  }): Promise<AuthDevice[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prismaService.authDevice.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy
    });
  }

  public async createAuthDevice(
    data: Prisma.AuthDeviceCreateInput
  ): Promise<AuthDevice> {
    return this.prismaService.authDevice.create({
      data
    });
  }

  public async updateAuthDevice(params: {
    data: Prisma.AuthDeviceUpdateInput;
    where: Prisma.AuthDeviceWhereUniqueInput;
  }): Promise<AuthDevice> {
    const { data, where } = params;

    return this.prismaService.authDevice.update({
      data,
      where
    });
  }

  public async deleteAuthDevice(
    where: Prisma.AuthDeviceWhereUniqueInput
  ): Promise<AuthDevice> {
    return this.prismaService.authDevice.delete({
      where
    });
  }
}

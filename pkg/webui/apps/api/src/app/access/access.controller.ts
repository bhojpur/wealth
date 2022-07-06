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

import { Access } from '@bhojpur/common/interfaces';
import { hasPermission, permissions } from '@bhojpur/common/permissions';
import type { RequestWithUser } from '@bhojpur/common/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  UseGuards
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Access as AccessModel } from '@prisma/client';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

import { AccessModule } from './access.module';
import { AccessService } from './access.service';
import { CreateAccessDto } from './create-access.dto';

@Controller('access')
export class AccessController {
  public constructor(
    private readonly accessService: AccessService,
    @Inject(REQUEST) private readonly request: RequestWithUser
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  public async getAllAccesses(): Promise<Access[]> {
    const accessesWithGranteeUser = await this.accessService.accesses({
      include: {
        GranteeUser: true
      },
      orderBy: { granteeUserId: 'asc' },
      where: { userId: this.request.user.id }
    });

    return accessesWithGranteeUser.map((access) => {
      if (access.GranteeUser) {
        return {
          granteeAlias: access.GranteeUser?.alias,
          id: access.id,
          type: 'RESTRICTED_VIEW'
        };
      }

      return {
        granteeAlias: 'Public',
        id: access.id,
        type: 'PUBLIC'
      };
    });
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  public async createAccess(
    @Body() data: CreateAccessDto
  ): Promise<AccessModel> {
    if (
      !hasPermission(this.request.user.permissions, permissions.createAccess)
    ) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }

    return this.accessService.createAccess({
      User: { connect: { id: this.request.user.id } }
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  public async deleteAccess(@Param('id') id: string): Promise<AccessModule> {
    const access = await this.accessService.access({ id });

    if (
      !hasPermission(this.request.user.permissions, permissions.deleteAccess) ||
      !access ||
      access.userId !== this.request.user.id
    ) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }

    return this.accessService.deleteAccess({
      id
    });
  }
}

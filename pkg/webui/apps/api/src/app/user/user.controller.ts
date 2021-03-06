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
import { PropertyService } from '@bhojpur/api/services/property/property.service';
import { PROPERTY_IS_READ_ONLY_MODE } from '@bhojpur/common/config';
import { User } from '@bhojpur/common/interfaces';
import { hasPermission, permissions } from '@bhojpur/common/permissions';
import type { RequestWithUser } from '@bhojpur/common/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  Inject,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { User as UserModel } from '@prisma/client';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

import { UserItem } from './interfaces/user-item.interface';
import { UserSettingsParams } from './interfaces/user-settings-params.interface';
import { UserSettings } from './interfaces/user-settings.interface';
import { UpdateUserSettingDto } from './update-user-setting.dto';
import { UpdateUserSettingsDto } from './update-user-settings.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  public constructor(
    private readonly configurationService: ConfigurationService,
    private readonly jwtService: JwtService,
    private readonly propertyService: PropertyService,
    @Inject(REQUEST) private readonly request: RequestWithUser,
    private readonly userService: UserService
  ) {}

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  public async deleteUser(@Param('id') id: string): Promise<UserModel> {
    if (
      !hasPermission(this.request.user.permissions, permissions.deleteUser) ||
      id === this.request.user.id
    ) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }

    return this.userService.deleteUser({
      id
    });
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  public async getUser(
    @Headers('accept-language') acceptLanguage: string
  ): Promise<User> {
    return this.userService.getUser(
      this.request.user,
      acceptLanguage?.split(',')?.[0]
    );
  }

  @Post()
  public async signupUser(): Promise<UserItem> {
    if (this.configurationService.get('ENABLE_FEATURE_READ_ONLY_MODE')) {
      const isReadOnlyMode = (await this.propertyService.getByKey(
        PROPERTY_IS_READ_ONLY_MODE
      )) as boolean;

      if (isReadOnlyMode) {
        throw new HttpException(
          getReasonPhrase(StatusCodes.FORBIDDEN),
          StatusCodes.FORBIDDEN
        );
      }
    }

    const hasAdmin = await this.userService.hasAdmin();

    const { accessToken, id, role } = await this.userService.createUser({
      role: hasAdmin ? 'USER' : 'ADMIN'
    });

    return {
      accessToken,
      role,
      authToken: this.jwtService.sign({
        id
      })
    };
  }

  @Put('setting')
  @UseGuards(AuthGuard('jwt'))
  public async updateUserSetting(@Body() data: UpdateUserSettingDto) {
    if (
      !hasPermission(
        this.request.user.permissions,
        permissions.updateUserSettings
      )
    ) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }

    const userSettings: UserSettings = {
      ...(<UserSettings>this.request.user.Settings.settings),
      ...data
    };

    for (const key in userSettings) {
      if (userSettings[key] === false || userSettings[key] === null) {
        delete userSettings[key];
      }
    }

    return await this.userService.updateUserSetting({
      userSettings,
      userId: this.request.user.id
    });
  }

  @Put('settings')
  @UseGuards(AuthGuard('jwt'))
  public async updateUserSettings(@Body() data: UpdateUserSettingsDto) {
    if (
      !hasPermission(
        this.request.user.permissions,
        permissions.updateUserSettings
      )
    ) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }

    const userSettings: UserSettingsParams = {
      currency: data.baseCurrency,
      userId: this.request.user.id
    };

    if (
      hasPermission(this.request.user.permissions, permissions.updateViewMode)
    ) {
      userSettings.viewMode = data.viewMode;
    }

    return await this.userService.updateUserSettings(userSettings);
  }
}

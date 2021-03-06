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

import { SubscriptionService } from '@bhojpur/api/app/subscription/subscription.service';
import { ConfigurationService } from '@bhojpur/api/services/configuration.service';
import { PrismaService } from '@bhojpur/api/services/prisma.service';
import { PropertyService } from '@bhojpur/api/services/property/property.service';
import { TagService } from '@bhojpur/api/services/tag/tag.service';
import { PROPERTY_IS_READ_ONLY_MODE, locale } from '@bhojpur/common/config';
import { User as IUser, UserWithSettings } from '@bhojpur/common/interfaces';
import {
  getPermissions,
  hasRole,
  permissions
} from '@bhojpur/common/permissions';
import { Injectable } from '@nestjs/common';
import { Prisma, Role, User, ViewMode } from '@prisma/client';
import { sortBy } from 'lodash';

import { UserSettingsParams } from './interfaces/user-settings-params.interface';
import { UserSettings } from './interfaces/user-settings.interface';

const crypto = require('crypto');

@Injectable()
export class UserService {
  public static DEFAULT_CURRENCY = 'INR';

  private baseCurrency: string;

  public constructor(
    private readonly configurationService: ConfigurationService,
    private readonly prismaService: PrismaService,
    private readonly propertyService: PropertyService,
    private readonly subscriptionService: SubscriptionService,
    private readonly tagService: TagService
  ) {
    this.baseCurrency = this.configurationService.get('BASE_CURRENCY');
  }

  public async getUser(
    {
      Account,
      alias,
      id,
      permissions,
      Settings,
      subscription
    }: UserWithSettings,
    aLocale = locale
  ): Promise<IUser> {
    const access = await this.prismaService.access.findMany({
      include: {
        User: true
      },
      orderBy: { User: { alias: 'asc' } },
      where: { GranteeUser: { id } }
    });
    let tags = await this.tagService.getByUser(id);

    if (
      this.configurationService.get('ENABLE_FEATURE_SUBSCRIPTION') &&
      subscription.type === 'Basic'
    ) {
      tags = [];
    }

    return {
      alias,
      id,
      permissions,
      subscription,
      tags,
      access: access.map((accessItem) => {
        return {
          alias: accessItem.User.alias,
          id: accessItem.id
        };
      }),
      accounts: Account,
      settings: {
        ...(<UserSettings>Settings.settings),
        baseCurrency: Settings?.currency ?? UserService.DEFAULT_CURRENCY,
        locale: (<UserSettings>Settings.settings)?.locale ?? aLocale,
        viewMode: Settings?.viewMode ?? ViewMode.DEFAULT
      }
    };
  }

  public async hasAdmin() {
    const usersWithAdminRole = await this.users({
      where: {
        role: {
          equals: 'ADMIN'
        }
      }
    });

    return usersWithAdminRole.length > 0;
  }

  public isRestrictedView(aUser: UserWithSettings) {
    return (aUser.Settings.settings as UserSettings)?.isRestrictedView ?? false;
  }

  public async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput
  ): Promise<UserWithSettings | null> {
    const {
      accessToken,
      Account,
      alias,
      authChallenge,
      createdAt,
      id,
      provider,
      role,
      Settings,
      Subscription,
      thirdPartyId,
      updatedAt
    } = await this.prismaService.user.findUnique({
      include: { Account: true, Settings: true, Subscription: true },
      where: userWhereUniqueInput
    });

    const user: UserWithSettings = {
      accessToken,
      Account,
      alias,
      authChallenge,
      createdAt,
      id,
      provider,
      role,
      Settings,
      thirdPartyId,
      updatedAt
    };

    if (user?.Settings) {
      if (!user.Settings.currency) {
        // Set default currency if needed
        user.Settings.currency = UserService.DEFAULT_CURRENCY;
      }
    } else if (user) {
      // Set default settings if needed
      user.Settings = {
        currency: UserService.DEFAULT_CURRENCY,
        settings: null,
        updatedAt: new Date(),
        userId: user?.id,
        viewMode: ViewMode.DEFAULT
      };
    }

    if (this.configurationService.get('ENABLE_FEATURE_SUBSCRIPTION')) {
      user.subscription =
        this.subscriptionService.getSubscription(Subscription);
    }

    let currentPermissions = getPermissions(user.role);

    if (this.configurationService.get('ENABLE_FEATURE_FEAR_AND_GREED_INDEX')) {
      currentPermissions.push(permissions.accessFearAndGreedIndex);
    }

    if (user.subscription?.type === 'Premium') {
      currentPermissions.push(permissions.reportDataGlitch);
    }

    if (this.configurationService.get('ENABLE_FEATURE_READ_ONLY_MODE')) {
      if (hasRole(user, Role.ADMIN)) {
        currentPermissions.push(permissions.toggleReadOnlyMode);
      }

      const isReadOnlyMode = (await this.propertyService.getByKey(
        PROPERTY_IS_READ_ONLY_MODE
      )) as boolean;

      if (isReadOnlyMode) {
        currentPermissions = currentPermissions.filter((permission) => {
          return !(
            permission.startsWith('create') ||
            permission.startsWith('delete') ||
            permission.startsWith('update')
          );
        });
      }
    }

    user.Account = sortBy(user.Account, (account) => {
      return account.name;
    });
    user.permissions = currentPermissions.sort();

    return user;
  }

  public async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prismaService.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy
    });
  }

  public createAccessToken(password: string, salt: string): string {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);

    return hash.digest('hex');
  }

  public async createUser(data: Prisma.UserCreateInput): Promise<User> {
    if (!data?.provider) {
      data.provider = 'ANONYMOUS';
    }

    let user = await this.prismaService.user.create({
      data: {
        ...data,
        Account: {
          create: {
            currency: this.baseCurrency,
            isDefault: true,
            name: 'Default Account'
          }
        },
        Settings: {
          create: {
            currency: this.baseCurrency
          }
        }
      }
    });

    if (data.provider === 'ANONYMOUS') {
      const accessToken = this.createAccessToken(
        user.id,
        this.getRandomString(10)
      );

      const hashedAccessToken = this.createAccessToken(
        accessToken,
        process.env.ACCESS_TOKEN_SALT
      );

      user = await this.prismaService.user.update({
        data: { accessToken: hashedAccessToken },
        where: { id: user.id }
      });

      return { ...user, accessToken };
    }

    return user;
  }

  public async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prismaService.user.update({
      data,
      where
    });
  }

  public async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    await this.prismaService.access.deleteMany({
      where: { OR: [{ granteeUserId: where.id }, { userId: where.id }] }
    });

    await this.prismaService.account.deleteMany({
      where: { userId: where.id }
    });

    await this.prismaService.analytics.delete({
      where: { userId: where.id }
    });

    await this.prismaService.order.deleteMany({
      where: { userId: where.id }
    });

    try {
      await this.prismaService.settings.delete({
        where: { userId: where.id }
      });
    } catch {}

    return this.prismaService.user.delete({
      where
    });
  }

  public async updateUserSetting({
    userId,
    userSettings
  }: {
    userId: string;
    userSettings: UserSettings;
  }) {
    const settings = userSettings as Prisma.JsonObject;

    await this.prismaService.settings.upsert({
      create: {
        settings,
        User: {
          connect: {
            id: userId
          }
        }
      },
      update: {
        settings
      },
      where: {
        userId: userId
      }
    });

    return;
  }

  public async updateUserSettings({
    currency,
    userId,
    viewMode
  }: UserSettingsParams) {
    await this.prismaService.settings.upsert({
      create: {
        currency,
        User: {
          connect: {
            id: userId
          }
        },
        viewMode
      },
      update: {
        currency,
        viewMode
      },
      where: {
        userId: userId
      }
    });

    return;
  }

  private getRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const result = [];

    for (let i = 0; i < length; i++) {
      result.push(
        characters.charAt(Math.floor(Math.random() * characters.length))
      );
    }
    return result.join('');
  }
}

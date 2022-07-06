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
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Provider } from '@prisma/client';
import { Strategy } from 'passport-google-oauth20';

import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  public constructor(
    private readonly authService: AuthService,
    readonly configurationService: ConfigurationService
  ) {
    super({
      callbackURL: `${configurationService.get(
        'ROOT_URL'
      )}/api/auth/google/callback`,
      clientID: configurationService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configurationService.get('GOOGLE_SECRET'),
      passReqToCallback: true,
      scope: ['email', 'profile']
    });
  }

  public async validate(
    request: any,
    token: string,
    refreshToken: string,
    profile,
    done: Function,
    done2: Function
  ) {
    try {
      const jwt: string = await this.authService.validateOAuthLogin({
        provider: Provider.GOOGLE,
        thirdPartyId: profile.id
      });
      const user = {
        jwt
      };

      done(null, user);
    } catch (error) {
      Logger.error(error, 'GoogleStrategy');
      done(error, false);
    }
  }
}

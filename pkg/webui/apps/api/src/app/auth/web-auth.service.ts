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

import { AuthDeviceDto } from '@bhojpur/api/app/auth-device/auth-device.dto';
import { AuthDeviceService } from '@bhojpur/api/app/auth-device/auth-device.service';
import { UserService } from '@bhojpur/api/app/user/user.service';
import { ConfigurationService } from '@bhojpur/api/services/configuration.service';
import type { RequestWithUser } from '@bhojpur/common/types';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import {
  GenerateAuthenticationOptionsOpts,
  GenerateRegistrationOptionsOpts,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  VerifyAuthenticationResponseOpts,
  VerifyRegistrationResponseOpts,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from '@simplewebauthn/server';

import {
  AssertionCredentialJSON,
  AttestationCredentialJSON
} from './interfaces/simplewebauthn';

@Injectable()
export class WebAuthService {
  public constructor(
    private readonly configurationService: ConfigurationService,
    private readonly deviceService: AuthDeviceService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @Inject(REQUEST) private readonly request: RequestWithUser
  ) {}

  get rpID() {
    return this.configurationService.get('WEB_AUTH_RP_ID');
  }

  get expectedOrigin() {
    return this.configurationService.get('ROOT_URL');
  }

  public async generateRegistrationOptions() {
    const user = this.request.user;

    const opts: GenerateRegistrationOptionsOpts = {
      rpName: 'Wealth',
      rpID: this.rpID,
      userID: user.id,
      userName: user.alias,
      timeout: 60000,
      attestationType: 'indirect',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: false,
        userVerification: 'required'
      }
    };

    const options = generateRegistrationOptions(opts);

    await this.userService.updateUser({
      data: {
        authChallenge: options.challenge
      },
      where: {
        id: user.id
      }
    });

    return options;
  }

  public async verifyAttestation(
    deviceName: string,
    credential: AttestationCredentialJSON
  ): Promise<AuthDeviceDto> {
    const user = this.request.user;
    const expectedChallenge = user.authChallenge;

    let verification: VerifiedRegistrationResponse;
    try {
      const opts: VerifyRegistrationResponseOpts = {
        credential,
        expectedChallenge,
        expectedOrigin: this.expectedOrigin,
        expectedRPID: this.rpID
      };
      verification = await verifyRegistrationResponse(opts);
    } catch (error) {
      Logger.error(error, 'WebAuthService');
      throw new InternalServerErrorException(error.message);
    }

    const { registrationInfo, verified } = verification;

    const devices = await this.deviceService.authDevices({
      where: { userId: user.id }
    });
    if (registrationInfo && verified) {
      const { counter, credentialID, credentialPublicKey } = registrationInfo;

      let existingDevice = devices.find(
        (device) => device.credentialId === credentialID
      );

      if (!existingDevice) {
        /**
         * Add the returned device to the user's list of devices
         */
        existingDevice = await this.deviceService.createAuthDevice({
          counter,
          credentialPublicKey,
          credentialId: credentialID,
          User: { connect: { id: user.id } }
        });
      }

      return {
        createdAt: existingDevice.createdAt.toISOString(),
        id: existingDevice.id
      };
    }

    throw new InternalServerErrorException('An unknown error occurred');
  }

  public async generateAssertionOptions(deviceId: string) {
    const device = await this.deviceService.authDevice({ id: deviceId });

    if (!device) {
      throw new Error('Device not found');
    }

    const opts: GenerateAuthenticationOptionsOpts = {
      allowCredentials: [
        {
          id: device.credentialId,
          transports: ['internal'],
          type: 'public-key'
        }
      ],
      rpID: this.rpID,
      timeout: 60000,
      userVerification: 'preferred'
    };

    const options = generateAuthenticationOptions(opts);

    await this.userService.updateUser({
      data: {
        authChallenge: options.challenge
      },
      where: {
        id: device.userId
      }
    });

    return options;
  }

  public async verifyAssertion(
    deviceId: string,
    credential: AssertionCredentialJSON
  ) {
    const device = await this.deviceService.authDevice({ id: deviceId });

    if (!device) {
      throw new Error('Device not found');
    }

    const user = await this.userService.user({ id: device.userId });

    let verification: VerifiedAuthenticationResponse;
    try {
      const opts: VerifyAuthenticationResponseOpts = {
        credential,
        authenticator: {
          credentialID: device.credentialId,
          credentialPublicKey: device.credentialPublicKey,
          counter: device.counter
        },
        expectedChallenge: `${user.authChallenge}`,
        expectedOrigin: this.expectedOrigin,
        expectedRPID: this.rpID
      };
      verification = verifyAuthenticationResponse(opts);
    } catch (error) {
      Logger.error(error, 'WebAuthService');
      throw new InternalServerErrorException({ error: error.message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
      device.counter = authenticationInfo.newCounter;

      await this.deviceService.updateAuthDevice({
        data: device,
        where: { id: device.id }
      });

      return this.jwtService.sign({
        id: user.id
      });
    }

    throw new Error();
  }
}

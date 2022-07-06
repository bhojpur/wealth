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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthDeviceDto } from '@bhojpur/api/app/auth-device/auth-device.dto';
import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from '@bhojpur/api/app/auth/interfaces/simplewebauthn';
import { SettingsStorageService } from '@bhojpur/client/services/settings-storage.service';
import {
  startAuthentication,
  startRegistration
} from '@simplewebauthn/browser';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebAuthnService {
  private static readonly WEB_AUTH_N_DEVICE_ID = 'WEB_AUTH_N_DEVICE_ID';

  public constructor(
    private http: HttpClient,
    private settingsStorageService: SettingsStorageService
  ) {}

  public isSupported() {
    return typeof PublicKeyCredential !== 'undefined';
  }

  public isEnabled() {
    return !!this.getDeviceId();
  }

  public register() {
    return this.http
      .get<PublicKeyCredentialCreationOptionsJSON>(
        `/api/v1/auth/webauthn/generate-registration-options`,
        {}
      )
      .pipe(
        catchError((error) => {
          console.warn('Could not register device', error);
          return of(null);
        }),
        switchMap((attOps) => {
          return startRegistration(attOps);
        }),
        switchMap((attResp) => {
          return this.http.post<AuthDeviceDto>(
            `/api/v1/auth/webauthn/verify-attestation`,
            {
              credential: attResp
            }
          );
        }),
        tap((authDevice) =>
          this.settingsStorageService.setSetting(
            WebAuthnService.WEB_AUTH_N_DEVICE_ID,
            authDevice.id
          )
        )
      );
  }

  public deregister() {
    const deviceId = this.getDeviceId();
    return this.http
      .delete<AuthDeviceDto>(`/api/v1/auth-device/${deviceId}`)
      .pipe(
        catchError((error) => {
          console.warn(`Could not deregister device ${deviceId}`, error);
          return of(null);
        }),
        tap(() =>
          this.settingsStorageService.removeSetting(
            WebAuthnService.WEB_AUTH_N_DEVICE_ID
          )
        )
      );
  }

  public login() {
    const deviceId = this.getDeviceId();
    return this.http
      .post<PublicKeyCredentialRequestOptionsJSON>(
        `/api/v1/auth/webauthn/generate-assertion-options`,
        { deviceId }
      )
      .pipe(
        switchMap(startAuthentication),
        switchMap((assertionResponse) => {
          return this.http.post<{ authToken: string }>(
            `/api/v1/auth/webauthn/verify-assertion`,
            {
              credential: assertionResponse,
              deviceId
            }
          );
        })
      );
  }

  private getDeviceId() {
    return this.settingsStorageService.getSetting(
      WebAuthnService.WEB_AUTH_N_DEVICE_ID
    );
  }
}

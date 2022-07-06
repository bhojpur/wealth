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
import { PROPERTY_CURRENCIES } from '@bhojpur/common/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PropertyService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async delete({ key }: { key: string }) {
    return this.prismaService.property.delete({
      where: { key }
    });
  }

  public async get() {
    const response: {
      [key: string]: boolean | object | string | string[];
    } = {
      [PROPERTY_CURRENCIES]: []
    };

    const properties = await this.prismaService.property.findMany();

    for (const property of properties) {
      let value = property.value;

      try {
        value = JSON.parse(property.value);
      } catch {}

      response[property.key] = value;
    }

    return response;
  }

  public async getByKey(aKey: string) {
    const properties = await this.get();
    return properties?.[aKey];
  }

  public async put({ key, value }: { key: string; value: string }) {
    return this.prismaService.property.upsert({
      create: { key, value },
      update: { value },
      where: { key }
    });
  }
}

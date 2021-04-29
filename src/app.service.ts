import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  welcomeMsg(): string {
    const version = process.env.npm_package_version;
    return `Auctions Scrapper v ${version}`;
  }
}

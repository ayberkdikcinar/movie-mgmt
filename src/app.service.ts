import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  checkHealthy(): string {
    return 'Healthy!';
  }
}

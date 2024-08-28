import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signin(): string {
    return 'Hello World!';
  }

  signup() {
    return null;
  }
}

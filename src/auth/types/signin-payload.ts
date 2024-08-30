import { ApiProperty } from '@nestjs/swagger';

export class SigninPayload {
  @ApiProperty()
  access_token: string;
}

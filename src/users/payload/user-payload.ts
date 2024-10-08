import { ApiProperty } from '@nestjs/swagger';

export class UserPayload {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  age: number;
}

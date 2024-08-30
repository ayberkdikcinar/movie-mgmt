import { ApiProperty } from '@nestjs/swagger';

export class BasePayload {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

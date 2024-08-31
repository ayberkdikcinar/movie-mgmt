import { ApiProperty } from '@nestjs/swagger';
import { BasePayload } from '../../types/base/base.payload';

export class MoviePayload extends BasePayload {
  @ApiProperty()
  name: string;

  @ApiProperty()
  ageRestriction: number;
}

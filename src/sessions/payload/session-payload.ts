import { ApiProperty } from '@nestjs/swagger';
import { BasePayload } from '../../types/base/base.payload';
import { TimeSlot } from '../enum/time-slot';

export class SessionPayload extends BasePayload {
  @ApiProperty()
  date: Date;

  @ApiProperty({ enum: TimeSlot })
  timeSlot: string;

  @ApiProperty()
  roomNumber: number;
}

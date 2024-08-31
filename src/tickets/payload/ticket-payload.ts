import { ApiProperty } from '@nestjs/swagger';
import { BasePayload } from '../../types/base/base.payload';
import { SessionPayload } from '../../sessions/payload/session-payload';

export class TicketPayload extends BasePayload {
  @ApiProperty()
  user_id: string;

  @ApiProperty()
  session: SessionPayload;

  @ApiProperty()
  isUsed: boolean;
}

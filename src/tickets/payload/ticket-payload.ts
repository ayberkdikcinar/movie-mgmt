import { ApiProperty } from '@nestjs/swagger';
import { BasePayload } from 'src/types/base/base.payload';
import { SessionPayload } from 'src/sessions/payload/session-payload';

export class TicketPayload extends BasePayload {
  @ApiProperty()
  user_id: string;

  @ApiProperty()
  session: SessionPayload;

  @ApiProperty()
  isUsed: boolean;
}

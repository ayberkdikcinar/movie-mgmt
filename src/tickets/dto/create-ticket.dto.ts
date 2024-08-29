import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateTicketDto {
  @ApiProperty({
    description: 'The session id that ticket belongs to.',
  })
  @IsNotEmpty()
  @IsString()
  sessionId: string;
}

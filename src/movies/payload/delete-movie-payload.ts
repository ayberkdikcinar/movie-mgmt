import { ApiProperty } from '@nestjs/swagger';

export class DeleteMoviePayload {
  @ApiProperty()
  id: string;
}

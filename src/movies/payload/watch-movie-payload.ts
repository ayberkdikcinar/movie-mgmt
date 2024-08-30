import { ApiProperty } from '@nestjs/swagger';

export class WatchMoviePayload {
  @ApiProperty({ default: 'You have successfully watched the movie' })
  message: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { MoviePayload } from './movie-payload';

export class WatchedHistoryPayload {
  @ApiProperty()
  watchedAt: Date;

  @ApiProperty()
  movie: MoviePayload;
}

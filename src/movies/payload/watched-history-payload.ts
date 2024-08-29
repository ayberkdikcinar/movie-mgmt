import { MovieEntity } from '../entity/movies.entity';

export interface WatchedHistoryPayload {
  watchedAt: Date;
  movie: MovieEntity;
}

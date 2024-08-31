import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieEntity } from './entity/movies.entity';
import { TicketsModule } from '../tickets/tickets.module';
import { WatchHistoryEntity } from './entity/watch-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovieEntity, WatchHistoryEntity]),
    TicketsModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}

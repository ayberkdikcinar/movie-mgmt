import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { SessionEntity } from './entity/sessions.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieEntity } from '../movies/entity/movies.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity, MovieEntity])],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}

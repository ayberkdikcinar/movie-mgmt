import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { SessionEntity } from './entity/sessions.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieEntity } from 'src/movies/entity/movies.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovieEntity, SessionEntity])],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}

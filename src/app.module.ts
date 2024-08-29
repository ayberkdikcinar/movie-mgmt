import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { TicketsModule } from './tickets/tickets.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { initPostgresConfig } from './config/postgres-config';
import { UserEntity } from './users/entity/user.entity';
import { MovieEntity } from './movies/entity/movies.entity';
import { SessionEntity } from './sessions/entity/sessions.entity';
import { TicketEntity } from './tickets/entity/tickets.entity';
import { SessionsModule } from './sessions/sessions.module';
import { UsersModule } from './users/users.module';
import { WatchHistoryEntity } from './movies/entity/watch-history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(
      initPostgresConfig([
        UserEntity,
        MovieEntity,
        SessionEntity,
        TicketEntity,
        WatchHistoryEntity,
      ]),
    ),
    AuthModule,
    MoviesModule,
    TicketsModule,
    SessionsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

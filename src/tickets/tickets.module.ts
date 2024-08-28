import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from 'src/sessions/entity/sessions.entity';
import { TicketEntity } from './entity/tickets.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity, SessionEntity])],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}

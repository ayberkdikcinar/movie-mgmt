import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from './entity/tickets.entity';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity]), SessionsModule],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}

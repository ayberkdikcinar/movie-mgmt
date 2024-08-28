import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionEntity } from 'src/sessions/entity/sessions.entity';
import { Repository } from 'typeorm';
import { TicketEntity } from './entity/tickets.entity';
import { generateUUID } from 'src/utils/gen-id';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,

    @InjectRepository(SessionEntity)
    private sessionsRepository: Repository<SessionEntity>,
  ) {}

  async buyTicket(ticket: CreateTicketDto): Promise<TicketEntity> {
    const { sessionId } = ticket;

    const session = await this.sessionsRepository.findOneBy({ id: sessionId });

    if (!session) {
      throw new BadRequestException(
        'Session that you are trying buy a ticket for is not exists.',
      );
    }

    const ticketObj = this.ticketRepository.create({
      id: generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      session,
    });

    return await this.ticketRepository.save(ticketObj);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketEntity } from './entity/tickets.entity';
import { generateUUID } from '../utils/gen-id';
import { adjustSessionDate, isDateInTheFuture } from '../utils/date';
import { TimeSlot } from '../sessions/enum/time-slot';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    private sessionsService: SessionsService,
  ) {}

  async purchaseTicket(
    user_id: string,
    ticket: CreateTicketDto,
  ): Promise<TicketEntity> {
    const { sessionId } = ticket;

    const session = await this.sessionsService.getSessionById(sessionId);

    if (!session) {
      throw new BadRequestException(
        'Session that you are trying to purchase a ticket is not exists.',
      );
    }

    if (
      !isDateInTheFuture(
        adjustSessionDate(new Date(session.date), session.timeSlot as TimeSlot),
      )
    ) {
      throw new BadRequestException(
        'Session that you are trying to purchase a ticket is expired.',
      );
    }

    const ticketObj = this.ticketRepository.create({
      id: generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      session,
      user_id,
    });

    return await this.ticketRepository.save(ticketObj);
  }

  async useTicket(id: string): Promise<boolean> {
    const result = await this.ticketRepository.update(
      { id: id },
      { isUsed: true, updatedAt: new Date() },
    );

    if (!result.affected) {
      throw new BadRequestException('Ticket could not be updated');
    }

    return true;
  }

  async findValidTicketByMovie(
    user_id: string,
    movie_id: string,
  ): Promise<TicketEntity | null> {
    const tickets = await this.ticketRepository.find({
      where: {
        user_id,
        isUsed: false,
        session: {
          movie: {
            id: movie_id,
          },
        },
      },
      relations: {
        session: {
          movie: true,
        },
      },
    });

    if (!tickets.length) {
      return null;
    }

    //any ticket that is valid? at least 1.
    for (const ticket of tickets) {
      const ticketIsValid = isDateInTheFuture(
        adjustSessionDate(
          new Date(ticket.session.date),
          ticket.session.timeSlot as TimeSlot,
          'start',
        ),
      );
      if (ticketIsValid) {
        return ticket;
      }
    }
    return null;
  }

  async isTicketValid(id: string): Promise<boolean> {
    const ticket = await this.ticketRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        session: {
          movie: true,
        },
      },
    });

    if (!ticket) {
      return false;
    }

    const ticketIsValid = isDateInTheFuture(
      adjustSessionDate(
        new Date(ticket.session.date),
        ticket.session.timeSlot as TimeSlot,
        'start',
      ),
    );

    if (!ticketIsValid) {
      return false;
    }

    return true;
  }
}

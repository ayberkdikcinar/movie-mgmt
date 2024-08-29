import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionEntity } from 'src/sessions/entity/sessions.entity';
import { Repository } from 'typeorm';
import { TicketEntity } from './entity/tickets.entity';
import { generateUUID } from 'src/utils/gen-id';
import { UserEntity } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { JWTUserPayload } from 'src/auth/types/jwt-user-payload';
import { parseTimeSlot } from 'src/utils/parse-timeslot';
import { TimeSlot } from 'src/sessions/enum/time-slot';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,

    @InjectRepository(SessionEntity)
    private sessionsRepository: Repository<SessionEntity>,
    private usersService: UsersService,
  ) {}

  async purchaseTicket(
    user: any,
    ticket: CreateTicketDto,
  ): Promise<TicketEntity> {
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
      user_id: user.id,
    });

    return await this.ticketRepository.save(ticketObj);
  }

  async getPurchasedTickets(user: JWTUserPayload) {
    return await this.ticketRepository.find({
      select: {
        id: true,
        session: {
          id: true,
          date: true,
          timeSlot: true,
          roomNumber: true,
          movie: {
            id: true,
            name: true,
            ageRestriction: true,
          },
        },
      },
      relations: {
        session: {
          movie: true,
        },
      },
      where: { user_id: user.id },
    });
  }

  async viewWatchHistory() {
    return null;
  }

  async validateTicket(user_id: string, ticket_id: string): Promise<boolean> {
    const ticket = await this.ticketRepository.findOne({
      where: {
        id: ticket_id,
        user_id,
      },
      relations: { session: true },
    });

    if (!ticket) {
      return false;
    }

    const currentDate = new Date();

    if (currentDate > new Date(ticket.session.date)) {
      return false;
    }

    //TODO: check the currentTime is passed or not. If it is not passed. it is valid.
    //To watch movies, should the time match with the session timeslot?
    //example msg: you can not watch this movie right now. it starts at 15:00.

    const { end } = parseTimeSlot(ticket.session.timeSlot as TimeSlot);
    if (currentDate.getHours() >= end) {
      return false;
    }
    return true;
  }
}

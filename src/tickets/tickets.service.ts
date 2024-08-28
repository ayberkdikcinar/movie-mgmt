import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionEntity } from 'src/sessions/entity/sessions.entity';
import { Repository } from 'typeorm';
import { TicketEntity } from './entity/tickets.entity';
import { generateUUID } from 'src/utils/gen-id';
import { UserEntity } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,

    @InjectRepository(SessionEntity)
    private sessionsRepository: Repository<SessionEntity>,
    private usersService: UsersService,
  ) {}

  async buyTicket(user: any, ticket: CreateTicketDto): Promise<TicketEntity> {
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

  async getPurchasedTickets(user: any) {
    const user2 = await this.usersService.findOneByUsername(user.username);
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
      where: { user: user2 },
    });
  }
}

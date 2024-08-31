import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { TicketEntity } from './entity/tickets.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SessionsService } from '../sessions/sessions.service';
import { isDateInTheFuture } from '../utils/date';
import { TimeSlot } from '../sessions/enum/time-slot';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SessionEntity } from '@src/sessions/entity/sessions.entity';

jest.mock('../utils/date', () => ({
  ...jest.requireActual('../utils/date'),
  isDateInTheFuture: jest.fn(),
}));

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketRepository: Repository<TicketEntity>;
  let sessionsService: SessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(TicketEntity),
          useClass: Repository,
        },
        {
          provide: SessionsService,
          useValue: {
            getSessionById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    ticketRepository = module.get<Repository<TicketEntity>>(
      getRepositoryToken(TicketEntity),
    );
    sessionsService = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('purchaseTicket', () => {
    it('should successfully create and save a ticket', async () => {
      const createTicketDto: CreateTicketDto = {
        sessionId: 'session-id',
      };

      const session: Partial<SessionEntity> = {
        id: 'session-id',
        date: new Date('2024-12-31'),
        timeSlot: TimeSlot['10:00-12:00'],
      };

      const ticketObj: Partial<TicketEntity> = {
        id: 'ticket-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        session: session as SessionEntity,
        user_id: 'user-id',
        isUsed: false,
      };

      (isDateInTheFuture as jest.Mock).mockReturnValue(true);

      jest
        .spyOn(sessionsService, 'getSessionById')
        .mockResolvedValue(session as SessionEntity);

      jest
        .spyOn(ticketRepository, 'create')
        .mockReturnValue(ticketObj as TicketEntity);
      jest
        .spyOn(ticketRepository, 'save')
        .mockResolvedValue(ticketObj as TicketEntity);

      const result = await service.purchaseTicket('user-id', createTicketDto);

      expect(result).toEqual(ticketObj);
    });

    it('should throw BadRequestException if session does not exist', async () => {
      jest.spyOn(sessionsService, 'getSessionById').mockResolvedValue(null);

      const createTicketDto: CreateTicketDto = {
        sessionId: 'session-id',
      };

      await expect(
        service.purchaseTicket('user-id', createTicketDto),
      ).rejects.toThrow(
        new BadRequestException(
          'Session that you are trying to purchase a ticket is not exists.',
        ),
      );
    });

    it('should throw BadRequestException if session is expired', async () => {
      const session = {
        id: 'session-id',
        date: '2024-01-01',
        timeSlot: TimeSlot['10:00-12:00'],
      };

      (isDateInTheFuture as jest.Mock).mockReturnValue(false);
      jest
        .spyOn(sessionsService, 'getSessionById')
        .mockResolvedValue(session as any);

      const createTicketDto: CreateTicketDto = {
        sessionId: 'session-id',
      };

      await expect(
        service.purchaseTicket('user-id', createTicketDto),
      ).rejects.toThrow(
        new BadRequestException(
          'Session that you are trying to purchase a ticket is expired.',
        ),
      );
    });
  });

  describe('useTicket', () => {
    it('should successfully update and mark a ticket as used', async () => {
      const ticketId = 'ticket-id';
      jest
        .spyOn(ticketRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.useTicket(ticketId);

      expect(result).toBe(true);
    });

    it('should throw BadRequestException if ticket could not be updated', async () => {
      const ticketId = 'ticket-id';
      jest
        .spyOn(ticketRepository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.useTicket(ticketId)).rejects.toThrow(
        new BadRequestException('Ticket could not be updated'),
      );
    });
  });

  describe('findValidTicketByMovie', () => {
    it('should return a valid ticket for a movie', async () => {
      const tickets = [
        {
          id: 'ticket-id',
          isUsed: false,
          session: { date: '2024-12-31', timeSlot: TimeSlot['10:00-12:00'] },
        },
      ];

      jest.spyOn(ticketRepository, 'find').mockResolvedValue(tickets as any);
      (isDateInTheFuture as jest.Mock).mockReturnValue(true);
      const result = await service.findValidTicketByMovie(
        'user-id',
        'movie-id',
      );

      expect(result).toEqual(tickets[0]);
    });

    it('should return null if no valid tickets are found', async () => {
      jest.spyOn(ticketRepository, 'find').mockResolvedValue([] as any);

      const result = await service.findValidTicketByMovie(
        'user-id',
        'movie-id',
      );

      expect(result).toBeNull();
    });

    it('should return null if no tickets are valid', async () => {
      const tickets = [
        {
          id: 'ticket-id',
          isUsed: false,
          session: { date: '2024-01-01', timeSlot: TimeSlot['10:00-12:00'] },
        },
      ];
      (isDateInTheFuture as jest.Mock).mockReturnValue(false);
      jest.spyOn(ticketRepository, 'find').mockResolvedValue(tickets as any);

      const result = await service.findValidTicketByMovie(
        'user-id',
        'movie-id',
      );

      expect(result).toBeNull();
    });
  });

  describe('isTicketValid', () => {
    it('should return true if ticket is valid', async () => {
      const ticket = {
        id: 'ticket-id',
        session: { date: '2024-12-31', timeSlot: TimeSlot['10:00-12:00'] },
      };

      (isDateInTheFuture as jest.Mock).mockReturnValue(true);
      jest.spyOn(ticketRepository, 'findOne').mockResolvedValue(ticket as any);

      const result = await service.isTicketValid('ticket-id');

      expect(result).toBe(true);
    });

    it('should return false if ticket is not valid', async () => {
      const ticket = {
        id: 'ticket-id',
        session: { date: '2024-01-01', timeSlot: TimeSlot['10:00-12:00'] },
      };

      jest.spyOn(ticketRepository, 'findOne').mockResolvedValue(ticket as any);
      (isDateInTheFuture as jest.Mock).mockReturnValue(false);
      const result = await service.isTicketValid('ticket-id');

      expect(result).toBe(false);
    });

    it('should return false if ticket does not exist', async () => {
      jest.spyOn(ticketRepository, 'findOne').mockResolvedValue(null);

      const result = await service.isTicketValid('ticket-id');

      expect(result).toBe(false);
    });
  });
});

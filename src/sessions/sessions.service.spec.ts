import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SessionsService } from './sessions.service';
import { SessionEntity } from './entity/sessions.entity';
import { MovieEntity } from '../movies/entity/movies.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { generateUUID } from '../utils/gen-id';
import { adjustSessionDate, isDateInTheFuture } from '../utils/date';
import { TimeSlot } from './enum/time-slot';

jest.mock('../utils/gen-id');
jest.mock('../utils/date');

describe('SessionsService', () => {
  let service: SessionsService;
  let sessionsRepository: Repository<SessionEntity>;
  let moviesRepository: Repository<MovieEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getRepositoryToken(SessionEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(MovieEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    sessionsRepository = module.get<Repository<SessionEntity>>(
      getRepositoryToken(SessionEntity),
    );
    moviesRepository = module.get<Repository<MovieEntity>>(
      getRepositoryToken(MovieEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    const createSessionDto: CreateSessionDto = {
      date: '2023-09-01',
      movieId: 'movie-id',
      roomNumber: 1,
      timeSlot: TimeSlot['10:00-12:00'],
    };

    it('should create a session successfully', async () => {
      (isDateInTheFuture as jest.Mock).mockReturnValue(true);
      (generateUUID as jest.Mock).mockReturnValue('session-id');
      (adjustSessionDate as jest.Mock).mockReturnValue(new Date('2023-09-01'));

      const movie = new MovieEntity();
      movie.id = 'movie-id';
      jest.spyOn(moviesRepository, 'findOneBy').mockResolvedValue(movie);
      jest.spyOn(sessionsRepository, 'findOne').mockResolvedValue(undefined);

      const savedSession: Partial<SessionEntity> = {
        date: new Date(),
        roomNumber: 1,
        timeSlot: TimeSlot['10:00-12:00'],
        id: 'session-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(sessionsRepository, 'create')
        .mockReturnValue(savedSession as SessionEntity);
      jest
        .spyOn(sessionsRepository, 'save')
        .mockResolvedValue(savedSession as SessionEntity);

      const result = await service.createSession(createSessionDto);

      expect(result).toEqual(savedSession);
    });

    it('should throw BadRequestException if the date is not in the future', async () => {
      (isDateInTheFuture as jest.Mock).mockReturnValue(false);

      await expect(service.createSession(createSessionDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if movie is not found', async () => {
      (isDateInTheFuture as jest.Mock).mockReturnValue(true);
      jest.spyOn(moviesRepository, 'findOneBy').mockResolvedValue(undefined);

      await expect(service.createSession(createSessionDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if the room is already booked', async () => {
      (isDateInTheFuture as jest.Mock).mockReturnValue(true);
      const movie = new MovieEntity();
      movie.id = 'movie-id';
      jest.spyOn(moviesRepository, 'findOneBy').mockResolvedValue(movie);

      const existingSession = new SessionEntity();
      jest
        .spyOn(sessionsRepository, 'findOne')
        .mockResolvedValue(existingSession);

      await expect(service.createSession(createSessionDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

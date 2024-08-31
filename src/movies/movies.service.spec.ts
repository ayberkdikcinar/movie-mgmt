import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MovieEntity } from './entity/movies.entity';
import { WatchHistoryEntity } from './entity/watch-history.entity';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { TicketsService } from '../tickets/tickets.service';
import { MovieQueryOptions } from './types/query/movie-query-options';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TicketEntity } from '../tickets/entity/tickets.entity';

describe('MoviesService', () => {
  let service: MoviesService;
  let moviesRepository: Repository<MovieEntity>;
  let watchHistoryRepository: Repository<WatchHistoryEntity>;
  let ticketsService: TicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(MovieEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(WatchHistoryEntity),
          useClass: Repository,
        },
        {
          provide: TicketsService,
          useValue: {
            findValidTicketByMovie: jest.fn(),
            useTicket: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    moviesRepository = module.get<Repository<MovieEntity>>(
      getRepositoryToken(MovieEntity),
    );
    watchHistoryRepository = module.get<Repository<WatchHistoryEntity>>(
      getRepositoryToken(WatchHistoryEntity),
    );
    ticketsService = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMovies', () => {
    it('should return an array of movies', async () => {
      const movies = [{ id: '1', name: 'Movie 1' }] as MovieEntity[];

      jest.spyOn(moviesRepository, 'find').mockResolvedValue(movies);

      const result = await service.getMovies({} as MovieQueryOptions);
      expect(result).toEqual(movies);
    });
  });

  describe('createMovie', () => {
    it('should create and return a movie', async () => {
      const createMovieDto: CreateMovieDto = {
        name: 'New Movie',
        ageRestriction: 16,
      };
      const movie = { id: '1', ...createMovieDto } as MovieEntity;

      jest.spyOn(moviesRepository, 'create').mockReturnValue(movie);
      jest.spyOn(moviesRepository, 'save').mockResolvedValue(movie);

      const result = await service.createMovie(createMovieDto);
      expect(result).toEqual(movie);
    });
  });

  describe('updateMovie', () => {
    it('should update and return the movie', async () => {
      const updateMovieDto: UpdateMovieDto = {
        id: '1',
        name: 'Updated Movie',
        ageRestriction: 16,
      };
      const movie = {
        id: '1',
        name: 'Old Movie',
        ageRestriction: 16,
      } as MovieEntity;

      jest.spyOn(moviesRepository, 'findOneBy').mockResolvedValue(movie);
      jest
        .spyOn(moviesRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateMovie(updateMovieDto);
      expect(result).toEqual({ ...movie, ...updateMovieDto });
    });

    it('should throw NotFoundException if the movie does not exist', async () => {
      jest.spyOn(moviesRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.updateMovie({
          id: '1',
          name: 'Updated Movie',
        } as UpdateMovieDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteMovie', () => {
    it('should delete the movie and return the id', async () => {
      const movie = { id: '1' } as MovieEntity;

      jest.spyOn(moviesRepository, 'findOneBy').mockResolvedValue(movie);
      jest
        .spyOn(moviesRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteMovie('1');
      expect(result).toEqual({ id: '1' });
    });

    it('should throw NotFoundException if the movie does not exist', async () => {
      jest.spyOn(moviesRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.deleteMovie('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if the movie could not be deleted', async () => {
      const movie = { id: '1' } as MovieEntity;

      jest.spyOn(moviesRepository, 'findOneBy').mockResolvedValue(movie);
      jest
        .spyOn(moviesRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.deleteMovie('1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('watchMovie', () => {
    it('should watch the movie successfully', async () => {
      const ticket = {
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isUsed: false,
      } as TicketEntity;

      const watchHistory = {
        id: '1',
        movie_id: '1',
        user_id: '1',
      } as WatchHistoryEntity;

      jest
        .spyOn(ticketsService, 'findValidTicketByMovie')
        .mockResolvedValue(ticket);
      jest.spyOn(ticketsService, 'useTicket').mockResolvedValue(true);
      jest
        .spyOn(watchHistoryRepository, 'create')
        .mockReturnValue(watchHistory);
      jest
        .spyOn(watchHistoryRepository, 'save')
        .mockResolvedValue(watchHistory);

      const result = await service.watchMovie('1', '1');
      expect(result).toEqual({
        message: 'You have successfully watched the movie',
      });
    });

    it('should throw BadRequestException if there is no valid ticket', async () => {
      jest
        .spyOn(ticketsService, 'findValidTicketByMovie')
        .mockResolvedValue(null);

      await expect(service.watchMovie('1', '1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if the ticket could not be used', async () => {
      const ticket: Partial<TicketEntity> = {
        user_id: '1',
        id: '1',
        isUsed: true,
      };

      jest
        .spyOn(ticketsService, 'findValidTicketByMovie')
        .mockResolvedValue(ticket as TicketEntity);
      jest.spyOn(ticketsService, 'useTicket').mockResolvedValue(false);

      await expect(service.watchMovie('1', '1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovieEntity } from './entity/movies.entity';
import { generateUUID } from '../utils/gen-id';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieErrorMessage } from './types/enums/movie-error-message';
import { MovieQueryOptions } from './types/query/movie-query-options';
import { TicketsService } from '../tickets/tickets.service';
import { WatchHistoryEntity } from './entity/watch-history.entity';
import { DeleteMoviePayload } from './payload/delete-movie-payload';
import { WatchMoviePayload } from './payload/watch-movie-payload';
import { MoviePayload } from './payload/movie-payload';
@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(MovieEntity)
    private moviesRepository: Repository<MovieEntity>,
    @InjectRepository(WatchHistoryEntity)
    private watchHistoryRepository: Repository<WatchHistoryEntity>,
    private ticketsService: TicketsService,
  ) {}

  async getMovies(queryOptions: MovieQueryOptions): Promise<MoviePayload[]> {
    const { pageSize, sessions, skip } = queryOptions;

    return await this.moviesRepository.find({
      relations: {
        sessions: sessions === 1,
      },
      skip: skip,
      take: pageSize,
    });
  }

  async getMovieById(id: string): Promise<MoviePayload> {
    return await this.moviesRepository.findOneBy({ id });
  }

  async createMovie(movie: CreateMovieDto): Promise<MoviePayload> {
    const { ageRestriction, name } = movie;
    const movieObj = this.moviesRepository.create({
      id: generateUUID(),
      ageRestriction,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.moviesRepository.save(movieObj);
  }

  async updateMovie(movie: UpdateMovieDto): Promise<MoviePayload> {
    const { ageRestriction, name, id } = movie;
    const existingMovie = await this.moviesRepository.findOneBy({ id });
    if (!existingMovie) {
      throw new NotFoundException(MovieErrorMessage.MovietNotFound);
    }
    const result = await this.moviesRepository.update(
      { id: id },
      { ageRestriction, name, updatedAt: new Date() },
    );

    if (!result.affected) {
      throw new BadRequestException(MovieErrorMessage.MovieNotUpdated);
    }

    return { ...existingMovie, ...movie };
  }

  async deleteMovie(id: string): Promise<DeleteMoviePayload> {
    const movie = await this.moviesRepository.findOneBy({
      id,
    });

    if (!movie) {
      throw new NotFoundException('');
    }
    const result = await this.moviesRepository.delete({ id: id });

    if (!result.affected) {
      throw new BadRequestException(MovieErrorMessage.MovieNotDeleted);
    }

    return { id };
  }

  async watchMovie(
    userId: string,
    movieId: string,
  ): Promise<WatchMoviePayload> {
    const ticket = await this.ticketsService.findValidTicketByMovie(
      userId,
      movieId,
    );
    if (!ticket) {
      throw new BadRequestException(
        'There is no valid ticket that user has for this movie.',
      );
    }

    /*  
    Below code is just working fine. However, it restricts watching movies due to the exact time slot check.
    So, for test purposes, maybe its better to not use it.
    
    const { date, timeSlot } = ticket.session;
    if (!isSessionActive(new Date(date), timeSlot as TimeSlot)) {
      throw new BadRequestException(
        `Please wait until the session is active. Date:${date}, Time:${timeSlot}`,
      );
    } */

    const isTicketUsed = await this.ticketsService.useTicket(ticket.id);

    if (!isTicketUsed) {
      throw new BadRequestException('Ticket could not be used.');
    }

    const watchHistoryObj = this.watchHistoryRepository.create({
      id: generateUUID(),
      movie_id: movieId,
      user_id: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.watchHistoryRepository.save(watchHistoryObj);

    return { message: 'You have successfully watched the movie' };
  }
}

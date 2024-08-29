import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovieEntity } from './entity/movies.entity';
import { generateUUID } from 'src/utils/gen-id';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieErrorMessage } from './types/enums/movie-error-message';
import { MovieQueryOptions } from './types/query/movie-query-options';
import { TicketsService } from 'src/tickets/tickets.service';
import { adjustSessionDate, isSessionActive } from 'src/utils/date';
import { TimeSlot } from 'src/sessions/enum/time-slot';
import { WatchHistoryEntity } from './entity/watch-history.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(MovieEntity)
    private moviesRepository: Repository<MovieEntity>,
    @InjectRepository(WatchHistoryEntity)
    private watchHistoryRepository: Repository<WatchHistoryEntity>,
    private ticketsService: TicketsService,
  ) {}

  async getMovies(queryOptions: MovieQueryOptions): Promise<MovieEntity[]> {
    const { pageSize, sessions, skip } = queryOptions;

    return await this.moviesRepository.find({
      relations: {
        sessions: sessions === 1,
      },
      skip: skip,
      take: pageSize,
    });
  }

  async getMovieById(id: string): Promise<MovieEntity> {
    return await this.moviesRepository.findOneBy({ id });
  }

  async createMovie(movie: CreateMovieDto): Promise<MovieEntity> {
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

  async updateMovie(movie: UpdateMovieDto): Promise<any> {
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

  async deleteMovie(id: string): Promise<{ id: string }> {
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

  async watchMovie(user_id: string, movie_id: string) {
    const ticket = await this.ticketsService.findValidTicketByMovie(
      user_id,
      movie_id,
    );
    if (!ticket) {
      throw new BadRequestException(
        'There is no valid ticket that user has for this movie.',
      );
    }

    /*  const { date, timeSlot } = ticket.session;
    
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
      movie_id,
      user_id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.watchHistoryRepository.save(watchHistoryObj);

    return { message: 'You have successfully watched the movie' };
  }

  async viewWatchHistory(userId: string) {
    const watchHistory = await this.watchHistoryRepository.find({
      where: { user_id: userId },
    });
    return watchHistory.map((entry) => entry);
  }
}

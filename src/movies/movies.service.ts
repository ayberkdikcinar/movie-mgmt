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
import { CreateSessionDto } from 'src/sessions/dto/create-session.dto';
import { MovieQueryOptions } from './types/query/movie-query-options';
@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(MovieEntity)
    private moviesRepository: Repository<MovieEntity>,
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
}

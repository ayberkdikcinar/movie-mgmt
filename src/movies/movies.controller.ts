import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieQueryOptions } from './types/query/movie-query-options';

@Controller('movies')
export class MoviesController {
  constructor(private readonly movieService: MoviesService) {}
  //for managers.
  @Get()
  async getMovies(@Query() movieQueryOptions: MovieQueryOptions) {
    return await this.movieService.getMovies(movieQueryOptions);
  }
  @Post()
  async createMovie(@Body() createMovieDto: CreateMovieDto) {
    return await this.movieService.createMovie(createMovieDto);
  }

  @Patch()
  async updateMovie(@Body() updateMovieDto: UpdateMovieDto) {
    return await this.movieService.updateMovie(updateMovieDto);
  }

  @Delete(':id')
  async deleteMovie(@Param('id') id: string) {
    return await this.movieService.deleteMovie(id);
  }
}

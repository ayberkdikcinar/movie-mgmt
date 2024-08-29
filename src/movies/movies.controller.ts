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
import { Roles } from 'src/auth/constants/role-decorator';
import { Role } from 'src/users/types/enum/role';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { JWTUserPayload } from 'src/auth/types/jwt-user-payload';

@Controller('movies')
export class MoviesController {
  constructor(private readonly movieService: MoviesService) {}

  @Get()
  async getMovies(@Query() movieQueryOptions: MovieQueryOptions) {
    return await this.movieService.getMovies(movieQueryOptions);
  }

  @Post()
  @Roles(Role.manager)
  async createMovie(@Body() createMovieDto: CreateMovieDto) {
    return await this.movieService.createMovie(createMovieDto);
  }

  @Patch()
  @Roles(Role.manager)
  async updateMovie(@Body() updateMovieDto: UpdateMovieDto) {
    return await this.movieService.updateMovie(updateMovieDto);
  }

  @Delete(':id')
  @Roles(Role.manager)
  async deleteMovie(@Param('id') id: string) {
    return await this.movieService.deleteMovie(id);
  }

  @Get(':movie_id/watch')
  async watchMovie(@Req() req: Request, @Param('movie_id') movie_id: string) {
    const user = req.user as JWTUserPayload;
    return await this.movieService.watchMovie(user.id, movie_id);
  }

  @Get('watch-history')
  async getWatchHistory(@Req() req: Request) {
    const user = req.user as JWTUserPayload;
    return await this.movieService.viewWatchHistory(user.id);
  }
}

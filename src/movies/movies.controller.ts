import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieQueryOptions } from './types/query/movie-query-options';
import { Roles } from 'src/auth/constants/role-decorator';
import { Role } from 'src/users/types/enum/role';

@Controller('movies')
export class MoviesController {
  constructor(private readonly movieService: MoviesService) {}
  //for managers.
  @Get()
  async getMovies(@Query() movieQueryOptions: MovieQueryOptions) {
    return await this.movieService.getMovies(movieQueryOptions);
  }

  @Post()
  @Roles(Role.manager)
  async createMovie(
    /* @Request() req: any, */
    @Body() createMovieDto: CreateMovieDto,
  ) {
    /*  console.log('user:', req?.user); */
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
}

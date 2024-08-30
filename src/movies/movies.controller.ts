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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DeleteMoviePayload } from './payload/delete-movie-payload';
import { WatchMoviePayload } from './payload/watch-movie-payload';
import { MoviePayload } from './payload/movie-payload';

@ApiTags('movies')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
@Controller('movies')
export class MoviesController {
  constructor(private readonly movieService: MoviesService) {}

  @ApiResponse({
    status: 200,
    type: MoviePayload,
    isArray: true,
    description:
      'Returns Movie list. If sessions=1 returns sessions:[] for each movie',
  })
  @Get()
  async getMovies(
    @Query() movieQueryOptions: MovieQueryOptions,
  ): Promise<MoviePayload[]> {
    return await this.movieService.getMovies(movieQueryOptions);
  }

  @ApiOperation({ summary: 'Protected route for managers only' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 201, type: MoviePayload })
  @Post()
  @Roles(Role.manager)
  async createMovie(
    @Body() createMovieDto: CreateMovieDto,
  ): Promise<MoviePayload> {
    return await this.movieService.createMovie(createMovieDto);
  }

  @ApiOperation({ summary: 'Protected route for managers only' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 200, type: MoviePayload })
  @Patch()
  @Roles(Role.manager)
  async updateMovie(
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<MoviePayload> {
    return await this.movieService.updateMovie(updateMovieDto);
  }

  @ApiOperation({ summary: 'Protected route for managers only' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 200, type: DeleteMoviePayload })
  @Delete(':id')
  @Roles(Role.manager)
  async deleteMovie(@Param('id') id: string): Promise<DeleteMoviePayload> {
    return await this.movieService.deleteMovie(id);
  }

  @ApiOperation({ summary: 'Protected route for customers only' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 200, type: WatchMoviePayload })
  @Get(':movieId/watch')
  @Roles(Role.customer)
  async watchMovie(
    @Req() req: Request,
    @Param('movieId') movieId: string,
  ): Promise<WatchMoviePayload> {
    const user = req.user as JWTUserPayload;
    return await this.movieService.watchMovie(user.id, movieId);
  }
}

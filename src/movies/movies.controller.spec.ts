import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MoviePayload } from './payload/movie-payload';
import { MovieQueryOptions } from './types/query/movie-query-options';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { DeleteMoviePayload } from './payload/delete-movie-payload';
import { WatchMoviePayload } from './payload/watch-movie-payload';

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        MoviesService,
        {
          provide: MoviesService,
          useValue: {
            getMovies: jest.fn(),
            createMovie: jest.fn(),
            updateMovie: jest.fn(),
            deleteMovie: jest.fn(),
            watchMovie: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get<MoviesService>(MoviesService);
  });

  it('should return movie list', async () => {
    const result: MoviePayload[] = [
      {
        ageRestriction: 18,
        name: 'test-movie1',
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ageRestriction: 18,
        name: 'test-movie2',
        id: '2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    jest.spyOn(service, 'getMovies').mockImplementation(async () => result);
    await expect(controller.getMovies({} as MovieQueryOptions)).resolves.toBe(
      result,
    );
  });

  it('should call getMovies with query options', async () => {
    const providedQueryOptions: Partial<MovieQueryOptions> = {
      page: 2,
      sessions: 1,
      pageSize: 50,
    };

    const result: MoviePayload[] = [
      {
        ageRestriction: 18,
        name: 'test-movie',
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    jest.spyOn(service, 'getMovies').mockResolvedValue(result);

    await controller.getMovies(providedQueryOptions as MovieQueryOptions);

    expect(service.getMovies).toHaveBeenCalledWith(providedQueryOptions);
  });

  it('should create a new movie', async () => {
    const createMovieDto: CreateMovieDto = {
      name: 'New Movie',
      ageRestriction: 16,
    };
    const result: MoviePayload = {
      id: '1',
      name: 'New Movie',
      ageRestriction: 16,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(service, 'createMovie').mockResolvedValue(result);

    expect(await controller.createMovie(createMovieDto)).toBe(result);
  });

  it('should update a movie', async () => {
    const updateMovieDto: UpdateMovieDto = {
      id: '1',
      name: 'Updated Movie',
    };
    const result: MoviePayload = {
      id: '1',
      name: 'Updated Movie',
      ageRestriction: 16,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(service, 'updateMovie').mockResolvedValue(result);

    expect(await controller.updateMovie(updateMovieDto)).toBe(result);
  });

  it('should delete a movie', async () => {
    const result: DeleteMoviePayload = { id: '1' };
    jest.spyOn(service, 'deleteMovie').mockResolvedValue(result);

    expect(await controller.deleteMovie('1')).toBe(result);
  });

  it('should allow a customer to watch a movie', async () => {
    const req = { user: { id: 'user1' } } as any;
    const result: WatchMoviePayload = {
      message: 'You have successfully watched the movie',
    };
    jest.spyOn(service, 'watchMovie').mockResolvedValue(result);

    expect(await controller.watchMovie(req, '1')).toBe(result);
  });
});

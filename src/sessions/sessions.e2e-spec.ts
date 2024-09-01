import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { SessionEntity } from './entity/sessions.entity';
import { MovieEntity } from '../movies/entity/movies.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import { TimeSlot } from './enum/time-slot';
import { Role } from '../users/types/enum/role';
import { createTestUserAndAuthenticate } from '../utils/test-utils';
import { UserEntity } from '../users/entity/user.entity';
import { generateUUID } from '../utils/gen-id';

describe('Sessions (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let sessionsRepository: Repository<SessionEntity>;
  let moviesRepository: Repository<MovieEntity>;
  let movieId: string;
  let movie: MovieEntity;
  let authTokenForManager: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    sessionsRepository = moduleFixture.get<Repository<SessionEntity>>(
      getRepositoryToken(SessionEntity),
    );
    moviesRepository = moduleFixture.get<Repository<MovieEntity>>(
      getRepositoryToken(MovieEntity),
    );

    const resultUserManager = await createTestUserAndAuthenticate(
      app,
      userRepository,
      Role.manager,
    );
    authTokenForManager = resultUserManager.token;

    movie = new MovieEntity();
    movie.id = 'test-movie-id';
    movie.name = 'Test Movie';
    movie.ageRestriction = 18;
    movie.createdAt = new Date();
    movie.updatedAt = new Date();
    await moviesRepository.save(movie);
    movieId = movie.id;
  });

  afterAll(async () => {
    await sessionsRepository.delete({});
    await moviesRepository.delete({});
    await app.close();
  });

  it('/sessions (POST) - success', async () => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);

    const createSessionDto: CreateSessionDto = {
      date: nextDay.toISOString(),
      movieId,
      roomNumber: 10,
      timeSlot: TimeSlot['10:00-12:00'],
    };

    return request(app.getHttpServer())
      .post('/sessions')
      .set('Authorization', `Bearer ${authTokenForManager}`)
      .send(createSessionDto)
      .expect(201);
  });

  it('/sessions (POST) - room already booked', async () => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);

    const createSessionDto: CreateSessionDto = {
      date: nextDay.toISOString(),
      movieId,
      roomNumber: 2,
      timeSlot: TimeSlot['14:00-16:00'],
    };
    jest
      .spyOn(sessionsRepository, 'findOne')
      .mockResolvedValue({ id: '1' } as SessionEntity);

    const response = await request(app.getHttpServer())
      .post('/sessions')
      .set('Authorization', `Bearer ${authTokenForManager}`)
      .send(createSessionDto)
      .expect(400);
    expect(response.body.message).toBe('room is already booked');
  });

  it('/sessions (POST) - movie not found', async () => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);

    const createSessionDto: CreateSessionDto = {
      date: nextDay.toISOString(),
      movieId: 'invalid-movie-id',
      roomNumber: 1,
      timeSlot: TimeSlot['12:00-14:00'],
    };

    const response = await request(app.getHttpServer())
      .post('/sessions')
      .set('Authorization', `Bearer ${authTokenForManager}`)
      .send(createSessionDto)
      .expect(404);

    expect(response.body.message).toBe('movie not found for add session');
  });

  it('/sessions/:movieId (GET) - success', async () => {
    const createSessionDto: CreateSessionDto = {
      date: new Date().toISOString(),
      movieId,
      roomNumber: 2,
      timeSlot: TimeSlot['12:00-14:00'],
    };

    await request(app.getHttpServer())
      .post('/sessions')
      .set('Authorization', `Bearer ${authTokenForManager}`)
      .send(createSessionDto);

    return request(app.getHttpServer())
      .get(`/sessions/${movieId}`)
      .set('Authorization', `Bearer ${authTokenForManager}`)
      .expect(200);
  });

  it('/sessions/:movieId (GET) - no sessions found', async () => {
    const nonExistentMovieId = 'non-existent-movie-id';

    return request(app.getHttpServer())
      .get(`/sessions/${nonExistentMovieId}`)
      .set('Authorization', `Bearer ${authTokenForManager}`)
      .expect(200)
      .expect([]);
  });
});

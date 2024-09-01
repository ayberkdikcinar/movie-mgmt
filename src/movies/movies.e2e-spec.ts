import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MovieEntity } from './entity/movies.entity';
import { WatchHistoryEntity } from './entity/watch-history.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { generateUUID } from '../utils/gen-id';
import { Role } from '../users/types/enum/role';
import { createTestUserAndAuthenticate } from '../utils/test-utils';
import { UserEntity } from '../users/entity/user.entity';

describe('MoviesService (e2e)', () => {
  let app: INestApplication;
  let movieRepository: Repository<MovieEntity>;
  let userRepository: Repository<UserEntity>;
  let watchHistoryRepository: Repository<WatchHistoryEntity>;
  let authTokenForManager: string;
  let authTokenForCustomer: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    movieRepository = moduleFixture.get<Repository<MovieEntity>>(
      getRepositoryToken(MovieEntity),
    );
    watchHistoryRepository = moduleFixture.get<Repository<WatchHistoryEntity>>(
      getRepositoryToken(WatchHistoryEntity),
    );

    const resultUserCustomer = await createTestUserAndAuthenticate(
      app,
      userRepository,
      Role.customer,
    );
    authTokenForCustomer = resultUserCustomer.token;
    const resultUserManager = await createTestUserAndAuthenticate(
      app,
      userRepository,
      Role.manager,
    );
    authTokenForManager = resultUserManager.token;
  });

  afterAll(async () => {
    await watchHistoryRepository.delete({});
    await movieRepository.delete({});
    await app.close();
  });

  describe('GET /movies', () => {
    it('should return a list of movies', async () => {
      await movieRepository.save({
        id: generateUUID(),
        name: 'Test Movie',
        ageRestriction: 18,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get('/movies')
        .set('Authorization', `Bearer ${authTokenForCustomer}`)
        .expect(200);

      expect(response.body.length).not.toBe(0);
    });
  });

  describe('GET /movies/:id', () => {
    it('should return a movie by ID', async () => {
      const movie = await movieRepository.save({
        id: generateUUID(),
        name: 'Test Movie',
        ageRestriction: 18,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get(`/movies/${movie.id}`)
        .set('Authorization', `Bearer ${authTokenForCustomer}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: movie.id,
        name: movie.name,
        ageRestriction: movie.ageRestriction,
      });
    });
  });

  describe('POST /movies', () => {
    it('should create a new movie if the user role is manager', async () => {
      const createMovieDto: CreateMovieDto = {
        name: 'New Movie',
        ageRestriction: 18,
      };

      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${authTokenForManager}`)
        .send(createMovieDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: createMovieDto.name,
        ageRestriction: createMovieDto.ageRestriction,
      });
    });

    it('should return 403 for non-manager users', async () => {
      const createMovieDto: CreateMovieDto = {
        name: 'New Movie',
        ageRestriction: 12,
      };

      await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${authTokenForCustomer}`)
        .send(createMovieDto)
        .expect(403);
    });
  });

  describe('PATCH /movies', () => {
    it('should update a movie', async () => {
      const movie = await movieRepository.save({
        id: generateUUID(),
        name: 'Old Movie',
        ageRestriction: 18,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updateMovieDto: UpdateMovieDto = {
        id: movie.id,
        name: 'Updated Movie',
        ageRestriction: 16,
      };

      const response = await request(app.getHttpServer())
        .patch('/movies')
        .set('Authorization', `Bearer ${authTokenForManager}`)
        .send(updateMovieDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: movie.id,
        name: updateMovieDto.name,
        ageRestriction: updateMovieDto.ageRestriction,
      });
    });

    it('should return 403 for non-manager users', async () => {
      const updateMovieDto: UpdateMovieDto = {
        id: generateUUID(),
        name: 'Updated Movie',
        ageRestriction: 16,
      };

      await request(app.getHttpServer())
        .patch('/movies')
        .set('Authorization', `Bearer ${authTokenForCustomer}`)
        .send(updateMovieDto)
        .expect(403);
    });
  });

  describe('DELETE /movies/:id', () => {
    it('should delete a movie', async () => {
      const movie = await movieRepository.save({
        id: generateUUID(),
        name: 'Movie to delete',
        ageRestriction: 18,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app.getHttpServer())
        .delete(`/movies/${movie.id}`)
        .set('Authorization', `Bearer ${authTokenForManager}`)
        .expect(200);

      const deletedMovie = await movieRepository.findOneBy({ id: movie.id });
      expect(deletedMovie).toBeNull();
    });

    it('should return 403 for non-manager users', async () => {
      const movie = await movieRepository.save({
        id: generateUUID(),
        name: 'Movie to delete',
        ageRestriction: 18,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app.getHttpServer())
        .delete(`/movies/${movie.id}`)
        .set('Authorization', `Bearer ${authTokenForCustomer}`)
        .expect(403);
    });
  });

  describe('GET /movies/:movieId/watch', () => {
    it('should return 400 if no valid ticket is found', async () => {
      const movie = await movieRepository.save({
        id: generateUUID(),
        name: 'Non-Available Movie',
        ageRestriction: 18,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app.getHttpServer())
        .get(`/movies/${movie.id}/watch`)
        .set('Authorization', `Bearer ${authTokenForCustomer}`)
        .expect(400);
    });
  });
});

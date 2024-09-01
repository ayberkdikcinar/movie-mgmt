import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TicketEntity } from './entity/tickets.entity';
import { SessionEntity } from '../sessions/entity/sessions.entity';
import { UserEntity } from '../users/entity/user.entity';
import { generateUUID } from '../utils/gen-id';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Role } from '../users/types/enum/role';
import { MovieEntity } from '../movies/entity/movies.entity';
import { createTestUserAndAuthenticate } from '../utils/test-utils';

describe('Tickets (e2e)', () => {
  let app: INestApplication;
  let ticketRepository: Repository<TicketEntity>;
  let sessionRepository: Repository<SessionEntity>;
  let userRepository: Repository<UserEntity>;
  let movieRepository: Repository<MovieEntity>;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    ticketRepository = moduleFixture.get<Repository<TicketEntity>>(
      getRepositoryToken(TicketEntity),
    );
    sessionRepository = moduleFixture.get<Repository<SessionEntity>>(
      getRepositoryToken(SessionEntity),
    );
    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    movieRepository = moduleFixture.get<Repository<MovieEntity>>(
      getRepositoryToken(MovieEntity),
    );

    const result = await createTestUserAndAuthenticate(
      app,
      userRepository,
      Role.customer,
    );

    authToken = result.token;
    userId = result.userId;
  });

  afterAll(async () => {
    await ticketRepository.delete({});
    await sessionRepository.delete({});
    await movieRepository.delete({});
    await app.close();
  });

  it('should successfully purchase a ticket with a future session date', async () => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);

    const movie = await movieRepository.save({
      id: generateUUID(),
      name: 'Test Movie',
      ageRestriction: 18,
      updatedAt: new Date(),
      createdAt: new Date(),
    });

    const session = await sessionRepository.save({
      id: generateUUID(),
      date: nextDay,
      timeSlot: '20:00-22:00',
      roomNumber: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      movie: movie,
    });

    const createTicketDto: CreateTicketDto = {
      sessionId: session.id,
    };

    const response = await request(app.getHttpServer())
      .post('/tickets/purchase')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createTicketDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });

  it('should throw badRequestExeption while purchase a ticket for unvalid session', async () => {
    const prevDay = new Date();
    prevDay.setDate(prevDay.getDate() - 1);

    const movie = await movieRepository.save({
      id: generateUUID(),
      name: 'Test Movie',
      ageRestriction: 18,
      updatedAt: new Date(),
      createdAt: new Date(),
    });

    const session = await sessionRepository.save({
      id: generateUUID(),
      date: prevDay,
      timeSlot: '10:00-12:00',
      roomNumber: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      movie: movie,
    });

    const createTicketDto: CreateTicketDto = {
      sessionId: session.id,
    };

    await request(app.getHttpServer())
      .post('/tickets/purchase')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createTicketDto)
      .expect(400);
  });
});

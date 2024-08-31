import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionEntity } from './entity/sessions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import { generateUUID } from '../utils/gen-id';

import { adjustSessionDate, isDateInTheFuture } from '../utils/date';
import { MovieEntity } from '../movies/entity/movies.entity';
import { SessionPayload } from './payload/session-payload';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionEntity)
    private sessionsRepository: Repository<SessionEntity>,
    @InjectRepository(MovieEntity)
    private moviesRepository: Repository<MovieEntity>,
  ) {}

  async createSession(
    createSessionDto: CreateSessionDto,
  ): Promise<SessionPayload> {
    const { date, movieId, roomNumber, timeSlot } = createSessionDto;

    if (
      !isDateInTheFuture(adjustSessionDate(new Date(date), timeSlot, 'start'))
    ) {
      throw new BadRequestException('The date must be in the future.');
    }

    const movie = await this.moviesRepository.findOneBy({ id: movieId });

    if (!movie) {
      throw new NotFoundException('movie not found for add session');
    }
    const roomBooked = await this.sessionsRepository.findOne({
      where: { roomNumber, timeSlot, date: new Date(date) },
    });

    if (roomBooked) {
      throw new BadRequestException('room is already booked');
    }

    const sessionObj = this.sessionsRepository.create({
      id: generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      date,
      roomNumber,
      timeSlot,
      movie,
    });

    const savedSession = await this.sessionsRepository.save(sessionObj);

    const response: SessionPayload = {
      id: savedSession.id,
      createdAt: savedSession.createdAt,
      updatedAt: savedSession.updatedAt,
      date: savedSession.date,
      roomNumber: savedSession.roomNumber,
      timeSlot: savedSession.timeSlot,
    };

    return response;
  }

  async getSessionById(id: string): Promise<SessionPayload> {
    return await this.sessionsRepository.findOneBy({ id });
  }

  async getSessionsByMovieId(movieId: string): Promise<SessionPayload[]> {
    return await this.sessionsRepository.find({
      where: { movie: { id: movieId } },
    });
  }
}

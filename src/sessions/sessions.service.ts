import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionEntity } from './entity/sessions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import { generateUUID } from 'src/utils/gen-id';

import { adjustSessionDate, isDateInTheFuture } from 'src/utils/date';
import { MovieEntity } from 'src/movies/entity/movies.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionEntity)
    private sessionsRepository: Repository<SessionEntity>,
    @InjectRepository(MovieEntity)
    private moviesRepository: Repository<MovieEntity>,
  ) {}

  async createSession(createSessionDto: CreateSessionDto) {
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

    return await this.sessionsRepository.save(sessionObj);
  }

  async getSessionById(id: string) {
    return await this.sessionsRepository.findOneBy({ id });
  }
}

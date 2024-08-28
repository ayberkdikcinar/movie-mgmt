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
import { MovieEntity } from 'src/movies/entity/movies.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionEntity)
    private sessionsRepository: Repository<SessionEntity>,

    @InjectRepository(MovieEntity)
    private readonly movieRepository: Repository<MovieEntity>,
  ) {}

  async createSession(createSessionDto: CreateSessionDto) {
    const { date, movieId, roomNumber, timeSlot } = createSessionDto;
    const movie = await this.movieRepository.findOneBy({ id: movieId });
    if (!movie) {
      throw new NotFoundException('movie not found for add session');
    }
    const roomBooked = await this.sessionsRepository.findOne({
      where: { roomNumber, timeSlot },
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
}

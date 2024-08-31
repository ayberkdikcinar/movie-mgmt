import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { generateUUID } from '../utils/gen-id';
import { UserPayload } from './payload/user-payload';
import * as bcrypt from 'bcrypt';
import { WatchHistoryEntity } from '../movies/entity/watch-history.entity';
import { WatchedHistoryPayload } from '../movies/payload/watched-history-payload';
import { TicketEntity } from '@src/tickets/entity/tickets.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(WatchHistoryEntity)
    private watchHistoryRepository: Repository<WatchHistoryEntity>,
  ) {}

  async findOneByUsername(username: string) {
    return await this.usersRepository.findOneBy({ username });
  }

  async findOneById(id: string) {
    return await this.usersRepository.findOneBy({ id });
  }

  //NOTE: for testing purposes.
  async findAll() {
    return await this.usersRepository.find({ relations: { tickets: true } });
  }

  async saveUser(user: CreateUserDto): Promise<UserPayload> {
    const hashedPassword = await this.hashPassword(user.password);
    const userObj = this.usersRepository.create({
      ...user,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: generateUUID(),
      tickets: [],
    });
    const newUser = await this.usersRepository.save(userObj);
    if (!newUser) {
      throw new BadRequestException(
        'something happened while saving the user!',
      );
    }
    const userPayload: UserPayload = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      age: newUser.age,
    };
    return userPayload;
  }

  async viewWatchHistory(userId: string): Promise<WatchedHistoryPayload[]> {
    const watchHistory = await this.watchHistoryRepository.find({
      where: { user_id: userId },
      relations: { movie: true },
    });

    return watchHistory.map((entry) => {
      return {
        watchedAt: entry.createdAt,
        movie: entry.movie,
      } as WatchedHistoryPayload;
    });
  }

  async getPurchasedTickets(user_id: string): Promise<TicketEntity[]> {
    const userWithTicketDetails = await this.usersRepository.findOne({
      select: {
        tickets: {
          id: true,
          isUsed: true,
          session: {
            id: true,
            date: true,
            roomNumber: true,
            timeSlot: true,
            movie: {
              id: true,
              name: true,
              ageRestriction: true,
            },
          },
        },
      },
      relations: {
        tickets: {
          session: {
            movie: true,
          },
        },
      },
      where: { id: user_id },
    });

    return userWithTicketDetails.tickets;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
}

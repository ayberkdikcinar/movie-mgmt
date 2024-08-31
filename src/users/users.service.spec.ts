import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserEntity } from './entity/user.entity';
import { WatchHistoryEntity } from '../movies/entity/watch-history.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { TicketEntity } from '../tickets/entity/tickets.entity';
import { Role } from './types/enum/role';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<UserEntity>;
  let watchHistoryRepository: Repository<WatchHistoryEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(WatchHistoryEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    watchHistoryRepository = module.get<Repository<WatchHistoryEntity>>(
      getRepositoryToken(WatchHistoryEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByUsername', () => {
    it('should return a user by username', async () => {
      const username = 'testUser';
      const user = new UserEntity();
      user.username = username;

      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(user);

      expect(await service.findOneByUsername(username)).toBe(user);
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      const id = 'some-id';
      const user = new UserEntity();
      user.id = id;

      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(user);

      expect(await service.findOneById(id)).toBe(user);
    });
  });

  describe('saveUser', () => {
    it('should save and return a user payload', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testUser',
        password: 'password123',
        age: 25,
        role: Role.customer,
      };
      const hashedPassword = 'hashedPassword123';
      const userEntity = new UserEntity();
      userEntity.id = 'generated-uuid';
      userEntity.username = createUserDto.username;
      userEntity.age = createUserDto.age;
      userEntity.role = createUserDto.role;
      userEntity.password = hashedPassword;

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve(hashedPassword));
      jest.spyOn(usersRepository, 'create').mockReturnValue(userEntity);
      jest.spyOn(usersRepository, 'save').mockResolvedValue(userEntity);

      const result = await service.saveUser(createUserDto);

      expect(result).toEqual({
        id: 'generated-uuid',
        username: createUserDto.username,
        age: createUserDto.age,
        role: createUserDto.role,
      });
    });

    it('should throw an exception if user save fails', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testUser',
        password: 'password123',
        age: 25,
        role: Role.customer,
      };
      const hashedPassword = 'hashedPassword123';

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve(hashedPassword));
      jest.spyOn(usersRepository, 'create').mockReturnValue(new UserEntity());
      jest.spyOn(usersRepository, 'save').mockResolvedValue(null);

      await expect(service.saveUser(createUserDto)).rejects.toThrow(
        new BadRequestException('something happened while saving the user!'),
      );
    });
  });

  describe('viewWatchHistory', () => {
    it('should return the watch history for a user', async () => {
      const userId = 'some-user-id';
      const watchHistoryEntity = new WatchHistoryEntity();
      watchHistoryEntity.createdAt = new Date();
      watchHistoryEntity.movie = {
        id: 'some-movie-id',
        name: 'Some Movie',
      } as any;

      jest
        .spyOn(watchHistoryRepository, 'find')
        .mockResolvedValue([watchHistoryEntity]);

      const result = await service.viewWatchHistory(userId);

      expect(result).toEqual([
        {
          watchedAt: watchHistoryEntity.createdAt,
          movie: watchHistoryEntity.movie,
        },
      ]);
    });
  });

  describe('getPurchasedTickets', () => {
    it('should return the purchased tickets for a user', async () => {
      const userId = 'some-user-id';
      const ticketEntity = new TicketEntity();
      ticketEntity.id = 'ticket-id';
      ticketEntity.isUsed = false;
      ticketEntity.session = {
        id: 'session-id',
        date: new Date(),
        roomNumber: 1,
        timeSlot: '12:00',
        movie: {
          id: 'movie-id',
          name: 'Some Movie',
          ageRestriction: 18,
        } as any,
      } as any;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue({
        tickets: [ticketEntity],
      } as any);

      const result = await service.getPurchasedTickets(userId);

      expect(result).toEqual([ticketEntity]);
    });
  });

  describe('hashPassword', () => {
    it('should hash the password', async () => {
      const password = 'plainPassword';
      const hashedPassword = 'hashedPassword';

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve(hashedPassword));

      expect(await service.hashPassword(password)).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should return true if passwords match', async () => {
      const password = 'plainPassword';
      const hashedPassword = 'hashedPassword';

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      expect(await service.comparePassword(password, hashedPassword)).toBe(
        true,
      );
    });

    it('should return false if passwords do not match', async () => {
      const password = 'plainPassword';
      const hashedPassword = 'differentHashedPassword';

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      expect(await service.comparePassword(password, hashedPassword)).toBe(
        false,
      );
    });
  });
});

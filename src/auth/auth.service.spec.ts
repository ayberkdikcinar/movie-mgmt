import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { SigninUserDto } from './dto/signin.dto';
import { UserEntity } from '../users/entity/user.entity';
import { Role } from '../users/types/enum/role';
import { CreateUserDto } from '@src/users/dto/create-user.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByUsername: jest.fn(),
            comparePassword: jest.fn(),
            findOneById: jest.fn(),
            saveUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return signin payload when credentials are valid', async () => {
    const signinUserDto: SigninUserDto = {
      username: 'testuser',
      password: 'testpass',
    };
    const user = {
      id: '123',
      username: 'testuser',
      password: 'hashedpassword',
      role: Role.customer,
    } as UserEntity;
    const token = 'testtokenaccess';

    jest.spyOn(usersService, 'findOneByUsername').mockResolvedValueOnce(user);
    jest.spyOn(usersService, 'comparePassword').mockResolvedValueOnce(true);
    jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce(token);

    const result = await authService.signin(signinUserDto);

    expect(result).toEqual({ access_token: token });
    expect(usersService.findOneByUsername).toHaveBeenCalledWith('testuser');
    expect(usersService.comparePassword).toHaveBeenCalledWith(
      'testpass',
      'hashedpassword',
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: '123',
      username: 'testuser',
      role: 'customer',
    });
  });

  it('should throw BadRequestException when user is not found', async () => {
    const signinUserDto: SigninUserDto = {
      username: 'wronguser',
      password: 'wrongpass',
    };

    jest.spyOn(usersService, 'findOneByUsername').mockResolvedValueOnce(null);

    await expect(authService.signin(signinUserDto)).rejects.toThrow(
      BadRequestException,
    );
    await expect(authService.signin(signinUserDto)).rejects.toThrow(
      'Check your credentials!',
    );
  });

  it('should throw BadRequestException when password does not match', async () => {
    const signinUserDto: SigninUserDto = {
      username: 'testuser',
      password: 'wrongpass',
    };
    const user = {
      id: '123',
      username: 'testuser',
      password: 'hashedpassword',
      role: Role.customer,
      age: 18,
    } as UserEntity;

    jest.spyOn(usersService, 'findOneByUsername').mockResolvedValueOnce(user);
    jest.spyOn(usersService, 'comparePassword').mockResolvedValueOnce(false);

    await expect(authService.signin(signinUserDto)).rejects.toThrow(
      BadRequestException,
    );
    await expect(authService.signin(signinUserDto)).rejects.toThrow(
      'Check your credentials!',
    );
  });

  it('should return the user data without password', async () => {
    const user = {
      id: '123',
      username: 'testuser',
      password: 'hashedpassword',
      role: Role.customer,
      age: 18,
    } as UserEntity;
    const { password, ...rest } = user;

    jest.spyOn(usersService, 'findOneById').mockResolvedValueOnce(user);

    const result = await authService.getUser(user.id);

    expect(result).toEqual(rest);
  });

  it('should throw BadRequestException when username already exists while signup', async () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      password: 'wrongpass',
      age: 18,
      role: Role.customer,
    };

    const user = {
      id: '123',
      username: 'testuser',
    } as UserEntity;

    jest.spyOn(usersService, 'findOneByUsername').mockResolvedValueOnce(user);

    await expect(authService.signup(createUserDto)).rejects.toThrow(
      'Username is in use!',
    );
  });

  it('should create user if username is uniqueue while signup', async () => {
    const createUserDto: CreateUserDto = {
      username: 'unique_username',
      password: 'wrongpass',
      age: 18,
      role: Role.customer,
    };

    jest.spyOn(usersService, 'findOneByUsername').mockResolvedValueOnce(null);

    await authService.signup(createUserDto);
    expect(usersService.saveUser).toHaveBeenCalledWith(createUserDto);
  });
});

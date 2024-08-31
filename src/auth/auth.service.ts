import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { SigninUserDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from '../users/payload/user-payload';
import { SigninPayload } from './types/signin-payload';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signin(signinUserDto: SigninUserDto): Promise<SigninPayload> {
    const { username, password } = signinUserDto;
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new BadRequestException('Check your credentials!');
    }
    const isPasswordMatches = await this.usersService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordMatches) {
      throw new BadRequestException('Check your credentials!');
    }
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signup(user: CreateUserDto): Promise<UserPayload> {
    const { username } = user;
    const existingUser = await this.usersService.findOneByUsername(username);
    if (existingUser) {
      throw new BadRequestException('Username is in use!');
    }

    return await this.usersService.saveUser(user);
  }

  //FOR TESTING PURPOSES
  async getUsers() {
    return await this.usersService.findAll();
  }

  async getUser(id: string): Promise<UserPayload> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      return null;
    }
    const { password, ...rest } = user;
    return rest;
  }
}

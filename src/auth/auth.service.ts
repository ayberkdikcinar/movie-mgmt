import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { SigninUserDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signin(signinUserDto: SigninUserDto): Promise<any> {
    const { username, password } = signinUserDto;
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new BadRequestException('Check your credentails!');
    }
    const isPasswordMatches = await this.usersService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordMatches) {
      throw new BadRequestException('Check your credentails!');
    }
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signup(user: CreateUserDto) {
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

  async getUser(id: string) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      return null;
    }
    const { password, ...rest } = user;
    return rest;
  }
}

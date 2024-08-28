import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SigninUserDto } from './dto/signin.dto';
import { Public } from './constants/public';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { JWTUserPayload } from './types/jwt-user-payload';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signup(createUserDto);
  }

  @Public()
  @Post('signin')
  async signin(@Body() signinUserDto: SigninUserDto) {
    return await this.authService.signin(signinUserDto);
  }
  //FOR TESTING PURPOSES.
  @Public()
  @Get('users')
  async getUsers() {
    return await this.authService.getUsers();
  }

  @Get('me')
  async getUser(@Req() req: Request) {
    const user = req.user as JWTUserPayload;
    console.log('user:', user);
    return await this.authService.getUser(user.id);
  }
}

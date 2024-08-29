import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SigninUserDto } from './dto/signin.dto';
import { Public } from './constants/public';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { JWTUserPayload } from './types/jwt-user-payload';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signup(createUserDto);
  }

  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({ status: 200, description: 'returns access token!' })
  @ApiResponse({ status: 400, description: 'Check your credentials!' })
  @Public()
  @Post('signin')
  async signin(@Body() signinUserDto: SigninUserDto) {
    return await this.authService.signin(signinUserDto);
  }

  //NOTE: for testing purposes.
  @Public()
  @Get('users')
  async getUsers() {
    return await this.authService.getUsers();
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'returns the signed in user' })
  @Get('me')
  async getUser(@Req() req: Request) {
    const user = req.user as JWTUserPayload;
    return await this.authService.getUser(user.id);
  }
}

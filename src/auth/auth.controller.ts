import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SigninUserDto } from './dto/signin.dto';
import { Public } from './constants/public';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { JWTUserPayload } from './types/jwt-user-payload';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserPayload } from '../users/payload/user-payload';
import { SigninPayload } from './types/signin-payload';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ status: 201, type: UserPayload })
  @Public()
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<UserPayload> {
    return await this.authService.signup(createUserDto);
  }

  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({ status: 200, type: SigninPayload })
  @ApiResponse({ status: 400, description: 'Check your credentials!' })
  @HttpCode(200)
  @Public()
  @Post('signin')
  async signin(@Body() signinUserDto: SigninUserDto): Promise<SigninPayload> {
    return await this.authService.signin(signinUserDto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: UserPayload })
  @Get('me')
  async getUser(@Req() req: Request): Promise<UserPayload> {
    const user = req.user as JWTUserPayload;
    return await this.authService.getUser(user.id);
  }
}

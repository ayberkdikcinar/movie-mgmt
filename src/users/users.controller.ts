import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { JWTUserPayload } from 'src/auth/types/jwt-user-payload';
import { WatchedHistoryPayload } from 'src/movies/payload/watched-history-payload';
import { Roles } from 'src/auth/constants/role-decorator';
import { Role } from './types/enum/role';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Protected route for customers only' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of movies watched by the signed in user.',
    type: WatchedHistoryPayload,
    isArray: true,
  })
  @Get('watch-history')
  @Roles(Role.customer)
  async viewWatchHistory(
    @Req() req: Request,
  ): Promise<WatchedHistoryPayload[]> {
    const user = req.user as JWTUserPayload;
    return await this.usersService.viewWatchHistory(user.id);
  }
}

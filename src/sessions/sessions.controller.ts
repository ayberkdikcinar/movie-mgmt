import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { Roles } from 'src/auth/constants/role-decorator';
import { Role } from 'src/users/types/enum/role';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SessionPayload } from './payload/session-payload';

@ApiTags('sessions')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sesionService: SessionsService) {}

  @ApiOperation({ summary: 'Protected route for managers only' })
  @ApiResponse({
    status: 201,
    type: SessionPayload,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Post()
  @Roles(Role.manager)
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<SessionPayload> {
    return await this.sesionService.createSession(createSessionDto);
  }

  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({
    status: 200,
    type: SessionPayload,
    isArray: true,
  })
  @Get(':movieId')
  async getSessionsByMovieId(
    @Param('movieId') movieId: string,
  ): Promise<SessionPayload[]> {
    return await this.sesionService.getSessionsByMovieId(movieId);
  }
}

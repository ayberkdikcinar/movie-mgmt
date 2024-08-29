import { Body, Controller, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { Roles } from 'src/auth/constants/role-decorator';
import { Role } from 'src/users/types/enum/role';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sesionService: SessionsService) {}

  @ApiOperation({ summary: 'Protected route for managers only' })
  @Post()
  @Roles(Role.manager)
  async createSession(@Body() createSessionDto: CreateSessionDto) {
    return await this.sesionService.createSession(createSessionDto);
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { Roles } from 'src/auth/constants/role-decorator';
import { Role } from 'src/users/types/enum/role';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sesionService: SessionsService) {}

  @Post()
  @Roles(Role.customer)
  async createSession(@Body() createSessionDto: CreateSessionDto) {
    return await this.sesionService.createSession(createSessionDto);
  }
}

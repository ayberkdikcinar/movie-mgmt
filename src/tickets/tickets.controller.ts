import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { JWTUserPayload } from 'src/auth/types/jwt-user-payload';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TicketPayload } from './payload/ticket-payload';
import { Roles } from 'src/auth/constants/role-decorator';
import { Role } from 'src/users/types/enum/role';
@ApiTags('tickets')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 400, description: 'Bad Request' })
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketService: TicketsService) {}

  @ApiOperation({ summary: 'Protected route for customers only' })
  @ApiResponse({ status: 201, type: TicketPayload })
  @Post('purchase')
  @Roles(Role.customer)
  async purchaseTicket(
    @Req() req: Request,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    const user = req.user as JWTUserPayload;
    return await this.ticketService.purchaseTicket(user.id, createTicketDto);
  }

  @Get()
  async getTickets(@Req() req: Request) {
    const user = req.user as JWTUserPayload;
    return await this.ticketService.getPurchasedTickets(user.id);
  }

  @Get('validate/:ticketId')
  async validateTicket(@Param('ticketId') ticketId: string) {
    const validTicket = await this.ticketService.isTicketValid(ticketId);
    if (!validTicket) {
      return { valid: false };
    }
    return { valid: true };
  }
}

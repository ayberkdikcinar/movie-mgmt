import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { JWTUserPayload } from 'src/auth/types/jwt-user-payload';
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketService: TicketsService) {}

  @Post('purchase')
  async purchaseTicket(
    @Req() req: Request,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    const user = req.user as JWTUserPayload;
    return await this.ticketService.purchaseTicket(user, createTicketDto);
  }

  @Get()
  async getTickets(@Req() req: Request) {
    const user = req.user as JWTUserPayload;

    return await this.ticketService.getPurchasedTickets(user);
  }

  @Get('validate/:movieId')
  async validateTicket(@Req() req: Request, @Param('movieId') movieId: string) {
    const user = req.user as JWTUserPayload;
    return await this.ticketService.validateTicket(user.id, movieId);
  }
}

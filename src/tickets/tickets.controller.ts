import { Body, Controller, Get, Post } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Request } from 'express';
import { Req } from '@nestjs/common';
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketService: TicketsService) {}

  @Post()
  async buyTicket(
    @Req() req: Request,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    const user = req.user;
    return await this.ticketService.buyTicket(user, createTicketDto);
  }

  @Get()
  async getTickets(@Req() req: Request) {
    const user = req.user;

    return await this.ticketService.getPurchasedTickets(user);
  }
}

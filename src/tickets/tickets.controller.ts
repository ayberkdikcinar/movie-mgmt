import { Body, Controller, Post } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketService: TicketsService) {}

  @Post()
  async buyTicket(@Body() createTicketDto: CreateTicketDto) {
    return await this.ticketService.buyTicket(createTicketDto);
  }
}

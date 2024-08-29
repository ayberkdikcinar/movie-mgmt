import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { TimeSlot } from '../enum/time-slot';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    description: 'The movie id that sessions belongs to.',
  })
  @IsNotEmpty()
  @IsString()
  movieId: string;

  @ApiProperty({
    description: 'Session date in a string format',
  })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: TimeSlot })
  @IsEnum(TimeSlot, {
    message: `Invalid time slot. Please choose a valid time slot. ${Object.values(
      TimeSlot,
    ).map((val) => '[' + val + ']')}`,
  })
  timeSlot: TimeSlot;

  @ApiProperty({
    description: 'The roomNumber',
    minimum: 1,
    maximum: 15,
  })
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(15)
  roomNumber: number;
}

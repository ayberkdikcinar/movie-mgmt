import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import { TimeSlot } from '../enum/time-slot';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsString()
  movieId: string;

  @IsDateString()
  date: string;

  @IsEnum(TimeSlot, {
    message: `Invalid time slot. Please choose a valid time slot. ${Object.values(
      TimeSlot,
    ).map((val) => '[' + val + ']')}`,
  })
  timeSlot: TimeSlot;

  @IsInt()
  @Min(0)
  roomNumber: number;
}

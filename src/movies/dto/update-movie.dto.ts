import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateMovieDto {
  @ApiProperty({ description: 'Movie id that is going to be updated.' })
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    minimum: 7,
    maximum: 18,
  })
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(18)
  ageRestriction: number;
}
